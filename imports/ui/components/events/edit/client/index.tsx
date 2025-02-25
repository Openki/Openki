// NOTE All dates are in local time unless otherwise noted. Moment doesn't have
// a "timezone-unaware" mode. Thus Momentjs is kept in the belief that the dates
// are all UTC even though we mean local time. The reason for this is that
// the timezone might actually change when a different region is selected. We
// wouldn't want the time or even date field to change because of this switch.

import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { intersection, uniq } from "lodash";
import { i18n } from "/imports/startup/both/i18next";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Session } from "meteor/session";
import { ReactiveDict } from "meteor/reactive-dict";
import { ReactiveVar } from "meteor/reactive-var";
import moment from "moment";

import * as Alert from "/imports/api/alerts/alert";
import { Courses } from "/imports/api/courses/courses";
import { EventModel, Events, EventVenueEntity } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Regions } from "/imports/api/regions/regions";
import { SaveFields } from "/imports/api/events/methods";
import { GroupEntityCustomCourseFields, Groups } from "/imports/api/groups/groups";
import * as CoursesMethods from "/imports/api/courses/methods";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { AffectedReplicaSelectors } from "/imports/utils/affected-replica-selectors";
import { LocalTime } from "/imports/utils/local-time";
import * as Tooltips from "/imports/utils/Tooltips";

import { PleaseLogin } from "/imports/ui/lib/please-login";
import * as Analytics from "/imports/ui/lib/analytics";

import "/imports/ui/components/buttons";
import "/imports/ui/components/richtext";
import "../../edit-location/client";
import "/imports/ui/components/price-policy";
import "/imports/ui/components/regions/tag";
import "/imports/ui/components/edit-custom-fields";

import "./template.html";
import "./styles.scss";
import { useTranslation } from "react-i18next";

type NewEventModel = {
  new: boolean;
  startLocal: string;
  endLocal: string;
  title: string;
  courseId: string;
  region: string;
  description: string;
  internal: boolean;
  sendReminder: boolean;
};

export type EventEditData =
  | (EventModel & Partial<NewEventModel>)
  | (NewEventModel & Partial<EventModel>);

const Template = TemplateAny as TemplateStaticTyped<
  "eventEdit",
  EventEditData,
  {
    state: ReactiveDict<{
      updateReplicasInfos: boolean;
      startDayChanged: boolean;
      timeChanged: boolean;
      updateReplicasTime: boolean;
      updateChangedReplicasTime: boolean;
    }>;
    parent: Blaze.TemplateInstance;
    selectedRegion: ReactiveVar<string>;
    selectedLocation: ReactiveVar<EventVenueEntity | undefined>;
    noRsvpChecked: ReactiveVar<boolean>;
    notifyChecked: ReactiveVar<boolean>;
    customFields: () => GroupEntityCustomCourseFields[];
  }
>;

const template = Template.eventEdit;

template.onCreated(function () {
  const instance = this;
  instance.busy(false);

  this.state = new ReactiveDict();
  this.state.setDefault({
    updateReplicasInfos: false,
    startDayChanged: false,
    timeChanged: false,
    updateReplicasTime: false,
    updateChangedReplicasTime: false,
  });

  const event = instance.data;
  if (event.courseId) {
    instance.subscribe("courseDetails", event.courseId);
  }

  if (event._id) {
    instance.subscribe("affectedReplica", instance.data._id);
  }

  const parent = instance.parentInstance();

  if (!parent) throw new Error("Unexpected undefined: parent");

  instance.parent = parent;
  {
    let region: string | undefined = instance.data.region;
    if (Regions.findFilter({}, 2).count() === 1) {
      region = region || Regions.findOne()?._id;
    }
    instance.selectedRegion = new ReactiveVar(region || Session.get("region"));
  }
  instance.selectedLocation = new ReactiveVar(instance.data.venue);

  instance.noRsvpChecked = new ReactiveVar(!!event.noRsvp);

  // Sending an event notification is only possible when the event is
  // attached to a course. Otherwise there is nobody to inform.
  const notifyPreset = !!(event.courseId && instance.data.new);
  instance.notifyChecked = new ReactiveVar(notifyPreset);

  function getRegion() {
    let region;
    if (instance.data.courseId) {
      const course = Courses.findOne(instance.data.courseId);
      if (!course) {
        throw new Error("Unexpected undefined: course");
      }

      region = course.region;
    } else {
      const selectedRegion = instance.selectedRegion.get();
      if (!selectedRegion || selectedRegion === "all") {
        return undefined;
      }
      region = selectedRegion;
    }

    if (region) {
      // The region was preset for the frame
      return Regions.findOne({ _id: region });
    }
    if (Regions.findFilter({}, 2).count() === 1) {
      // There is only one region
      return Regions.findOne();
    }
    return Regions.currentRegion();
  }

  function getGroups() {
    const { courseId } = Template.currentData();
    const groups = [];

    // We have this 'secret' feature where you can set a group ID
    // in the URL to assign a group to the event on creation
    if (Router.current().params.query.group) {
      groups.push(Router.current().params.query.group as string);
    }

    const defaultTeamGroups = getRegion()?.defaultTeamGroups;
    if (defaultTeamGroups) {
      groups.push(...defaultTeamGroups);
    }

    if (courseId) {
      const course = Courses.findOne(courseId);
      if (!course) {
        throw new Error("Unexpected undefined: course");
      }
      groups.push(...course.groupOrganizers);
    }

    // remove double groups
    return uniq(groups);
  }

  instance.autorun(() => {
    getGroups().forEach((g) => {
      instance.subscribe("group", g);
    });
  });

  instance.customFields = (type?: "singleLine" | "multiLine") => {
    const groups = getGroups();

    return (
      Groups.find({ _id: { $in: groups } })
        .fetch()
        .flatMap((g) => g.customCourseFields || [])
        // when type is undefined all will get back
        .filter((g) => !type || (g.type || "singleLine") === type)
    );
  };
});

function getEventStartMoment(instance: ReturnType<(typeof Template)["instance"]>) {
  return LocalTime.fromString(
    instance.$(".js-event-start-date").val() as string,
    instance.$(".js-event-start-time").val() as string,
  );
}

function getEventEndMoment(instance: ReturnType<(typeof Template)["instance"]>) {
  const startMoment = getEventStartMoment(instance);
  let endMoment = LocalTime.fromString(
    startMoment.format("L"),
    instance.$(".js-event-end-time").val() as string,
  );

  // If the end time is earlier than the start time, assume the event
  // spans into the next day. This might result in some weird behavior
  // around hour-lapses due to DST (where 1:30 may be 'later' than 2:00).
  // Well maybe you shouldn't schedule your events to start or end
  // in these politically fucked hours.
  if (endMoment.diff(startMoment) < 0) {
    endMoment = LocalTime.fromString(
      startMoment.add(1, "day").format("L"),
      instance.$(".js-event-end-time").val() as string,
    );
  }

  return endMoment;
}

function getEventDuration(instance: ReturnType<(typeof Template)["instance"]>) {
  const duration = Number.parseInt(instance.$(".js-event-duration").val() as string, 10) || 0;
  return Math.max(0, duration);
}

/* Patch the end time and the duration when start, end or duration changes */
function updateTimes(instance: ReturnType<(typeof Template)["instance"]>, updateEnd: boolean) {
  const start = getEventStartMoment(instance);
  let end = getEventEndMoment(instance);
  let duration = getEventDuration(instance);
  if (!start.isValid() || !end.isValid()) {
    // If you put into the machine wrong figures, will the right answers come out?
    return;
  }

  if (updateEnd) {
    end = moment(start).add(duration, "minutes");
  }

  if (end.isBefore(start)) {
    // Let sanity prevail
    end = start;
    duration = 0;
  }

  duration = end.diff(start, "minutes");
  instance.$(".js-event-start-date").val(start.format("L"));
  instance.$(".js-event-start-time").val(start.format("LT"));
  instance.$(".js-event-end-time").val(end.format("LT"));
  instance.$(".js-event-duration").val(duration.toString());
}

/**
 * validates input for maxParticipants
 * @param maxParticipants the user-input
 * @return an integer if the input passed validation.
 */
const validateMaxParticipants = (maxParticipants: string) => {
  const intVal = Number.parseInt(maxParticipants, 10);
  if (Number.isNaN(intVal)) {
    Alert.error(i18n("event.edit.mustBeInteger", "Must be a whole number"));
    return false;
  }
  if (intVal < 0) {
    Alert.error(i18n("event.edit.mustBePositive", "The number must be positive"));
    return false;
  }
  return intVal;
};

template.onRendered(function () {
  const instance = this;
  updateTimes(instance, false);

  instance.autorun(() => {
    const desiredLocale = Session.get("locale");

    if (!desiredLocale) {
      // if nothing set we wait for a change
      return;
    }

    const language = desiredLocale.substring(0, 2);

    const $dateInput = instance.$(".js-event-start-date");

    // remove, re-add the datepicker when the locale changed
    $dateInput.datepicker("destroy");

    // I don't know why, but language: moment.locale() does not work here.
    // So instead we clobber the 'en' settings with settings for the
    // selected language.
    $dateInput.datepicker({
      language,
      weekStart: moment.localeData().firstDayOfWeek(),
      autoclose: true,
      startDate: new Date(),
      format: {
        toDisplay(date) {
          return moment.utc(date).format("L");
        },
        toValue(date) {
          return moment.utc(date, "L").toDate();
        },
      },
    });
  });
});

template.helpers({
  hasParentCourse() {
    return Boolean(this.courseId);
  },

  showRegionTag() {
    if (!this._id || this.courseId) {
      return false;
    }
    return true;
  },

  localDate(date: string) {
    return moment.utc(date).format("L");
  },

  affectedReplicaCount(this: EventEditData) {
    return Events.find(AffectedReplicaSelectors(this as any)).count();
  },

  disabledIfDayChanged() {
    if (Template.instance().state.get("startDayChanged")) {
      return "disabled";
    }
    return "";
  },

  startDayChanged() {
    return Template.instance().state.get("startDayChanged");
  },

  timeChanged() {
    return Template.instance().state.get("timeChanged");
  },

  changedReplicas(this: EventEditData) {
    return Events.find(AffectedReplicaSelectors(this as any))
      .fetch()
      .filter((replica) => !replica.sameTime(this));
  },

  emphasizeClass() {
    if (Template.instance().state.get("updateReplicasTime")) {
      return "is-emphasized";
    }
    return "";
  },

  updateChangedReplicasTime() {
    return Template.instance().state.get("updateChangedReplicasTime");
  },

  showRegionSelection() {
    // You can select the region for events that are new and not associated
    // with a course
    if (this._id || this.courseId) {
      return false;
    }
    return true;
  },

  showVenueSelection() {
    const selectedRegion = Template.instance().selectedRegion.get();
    return selectedRegion && selectedRegion !== "all";
  },

  disableForPast(this: EventEditData) {
    return this.start && this.start < new Date() ? "disabled" : "";
  },

  isInternal() {
    return this.internal ? "checked" : null;
  },

  sendReminder() {
    return this.sendReminder ? "checked" : null;
  },

  course(this: EventEditData) {
    const { courseId } = this;
    if (courseId) {
      return Courses.findOne({ _id: courseId });
    }
    return false;
  },

  noRsvp() {
    return Template.instance().noRsvpChecked.get() ? "checked" : null;
  },
  noRsvpChecked() {
    return Template.instance().noRsvpChecked.get();
  },
  maxParticipants() {
    // show empty input instead of 0
    return this.maxParticipants || "";
  },
  notifyChecked() {
    return Template.instance().notifyChecked.get();
  },
  customFields() {
    const courseId = Template.instance().data.courseId;
    if (courseId) {
      return Courses.findOne({ _id: courseId })?.customFields;
    }
    return undefined;
  },
  venueEditAttr() {
    const instance = Template.instance();
    return {
      region: instance.data.region,
      value: instance.selectedLocation.get(),
      onChange: (newValue: EventVenueEntity) => {
        instance.selectedLocation.set(newValue);
      },
    };
  },
});

template.events({
  submit(event, instance) {
    event.preventDefault();

    const start = getEventStartMoment(instance);
    if (!start.isValid()) {
      const exampleDate = moment().format("L");
      Alert.error(
        i18n(
          "event.edit.dateFormatWarning",
          "The date format must be of the {EXAMPLEDATE} format.",
          {
            EXAMPLEDATE: exampleDate,
          },
        ),
      );
      return;
    }
    const end = getEventEndMoment(instance);

    const title = instance.$(".js-event-title").val() as string;
    if (title.length === 0) {
      Alert.error(i18n("event.edit.plzProvideTitle", "Please provide a title"));
      return;
    }

    const $description = instance.$(".js-event-description");
    if (!$description.text()) {
      Alert.error(i18n("event.edit.plzProvideDescr", "Please provide a description"));
      return;
    }

    if (PublicSettings.eventDescriptionMax) {
      if ($description.text().length > PublicSettings.eventDescriptionMax) {
        Alert.error(
          i18n("_inputField.maxlength", {
            MAXNUMBER: PublicSettings.eventDescriptionMax,
            NUMBER: $description.text().length - PublicSettings.eventDescriptionMax,
          }),
        );
        return;
      }
    }

    const noRsvp = instance.$(".js-check-no-rsvp").is(":checked");

    let maxParticipants;
    if (!noRsvp) {
      maxParticipants = validateMaxParticipants(
        (instance.$(".js-event-max-participants").val() as string) || "0",
      );
      // validation was unsuccessful
      if (maxParticipants === false) {
        return;
      }
    } else {
      // if no rsvp is set there is none limit for maxParticipants;
      maxParticipants = 0;
    }

    const editevent = {
      title,
      description: $description.html(),
      venue: instance.selectedLocation.get() || {},
      room: instance.$(".js-event-room").val() as string,
      startLocal: LocalTime.toString(start),
      endLocal: LocalTime.toString(end),
      internal: instance.$(".js-check-event-internal").is(":checked"),
      sendReminder: instance.$(".js-check-event-send-reminder").is(":checked"),
      noRsvp,
      maxParticipants,
    } as SaveFields;

    let eventId = instance.data._id || "";
    const isNew = eventId === "";
    if (isNew) {
      if (start.isBefore(LocalTime.now())) {
        Alert.error(
          i18n(
            "event.edit.startInPast",
            "The event starts in the past. Have you selected a start date and time?",
          ),
        );
        return;
      }

      if (instance.data.courseId) {
        const course = Courses.findOne(instance.data.courseId);
        if (!course) {
          throw new Error("Unexpected undefined: course");
        }

        editevent.region = course.region;
        editevent.courseId = instance.data.courseId;
      } else {
        editevent.region = instance.selectedRegion.get();
        if (!editevent.region || editevent.region === "all") {
          Alert.error(
            i18n("event.edit.plzSelectRegion", "Please select the region for this event"),
          );
          return;
        }

        // We have this 'secret' feature where you can set a group ID
        // in the URL to assign a group to the event on creation
        const groups = [];
        if (Router.current().params.query.group) {
          groups.push(Router.current().params.query.group as string);
        }
        editevent.groups = groups;
      }
    }

    const customFields = instance.customFields().map((i) => {
      return {
        name: i.name,
        displayText: i.displayText,
        value: instance.$(`.js-custom-field-${i.name}`).val() as string,
        visibleFor: i.visibleFor,
      };
    });

    const updateReplicasInfos = instance.state.get("updateReplicasInfos");
    const updateReplicasTime =
      !instance.state.get("startDayChanged") &&
      instance.state.get("timeChanged") &&
      instance.state.get("updateReplicasTime");
    const updateChangedReplicasTime =
      updateReplicasTime && instance.state.get("updateChangedReplicasTime");
    const sendNotifications = instance.$(".js-check-notify").is(":checked");
    const addNotificationMessage = instance.$(".js-event-add-message").val() as string;

    instance.busy("saving");
    PleaseLogin(instance, async () => {
      try {
        const result = await EventsMethods.save(
          eventId,
          editevent,
          updateReplicasInfos,
          updateReplicasTime,
          updateChangedReplicasTime,
          sendNotifications,
          addNotificationMessage,
        );
        if (!result) {
          throw new Error("Unexpected undefined: eventId");
        }
        eventId = result;

        if (isNew) {
          Router.go("showEvent", { _id: eventId });
          Alert.success(
            i18n("message.eventCreated", 'The event "{TITLE}" has been created!', {
              TITLE: editevent.title,
            }),
          );

          const course = Courses.findOne(editevent.courseId);
          if (!course) {
            throw new Error("Unexpected undefined: course");
          }
          const user = Meteor.user();
          if (!user) {
            throw new Error("Unexpected undefined: user");
          }
          let role;
          if (intersection(user.badges, course.editors).length > 0) {
            role = "team";
          } else if (user.privileged("admin")) {
            role = "admin";
          } else {
            role = "unknown";
          }
          Analytics.trackEvent(
            "Event creations",
            `Event creations as ${role}`,
            Regions.findOne(course.region)?.nameEn,
            Math.round(
              (new Date().getTime() - course.time_created.getTime()) /
                1000 /
                60 /
                60 /
                24 /* Umrechnung in Tage */,
            ),
          );
        } else {
          Alert.success(
            i18n(
              "message.eventChangesSaved",
              'Your changes to the event "{TITLE}" have been saved.',
              { TITLE: editevent.title },
            ),
          );
        }

        if (updateReplicasInfos || updateReplicasTime) {
          Alert.success(
            i18n("eventEdit.replicatesUpdated", 'Replicas of "{TITLE}" have also been updated.', {
              TITLE: editevent.title,
            }),
          );
        }

        if (instance.data.courseId) {
          await CoursesMethods.save(instance.data.courseId, { customFields });
        }

        (instance.parent as any).editing.set(false);
      } catch (err) {
        Alert.serverError(
          err,
          i18n("eventEdit.replicatesUpdated.error", "Saving the event went wrong"),
        );
      } finally {
        instance.busy(false);
      }
    });
  },

  "click .js-event-cancel"(_event, instance) {
    if (instance.data.new) {
      window.history.back();
    } else {
      (instance.parent as any).editing.set(false);
    }
  },

  "click .js-toggle-duration"() {
    Tooltips.hide();

    $(".js-time-end > *").toggle();
  },

  "click .js-check-notify"(_event, instance) {
    instance.notifyChecked.set(instance.$(".js-check-notify").is(":checked"));
  },

  "click .js-check-no-rsvp"(_event, instance) {
    instance.noRsvpChecked.set(instance.$(".js-check-no-rsvp").is(":checked"));
  },

  "change .js-event-start-date"(this: EventEditData, event, instance) {
    const newDate = instance.$(event.target as any).val();
    instance.state.set({
      startDayChanged: !moment(newDate, "L").isSame(this.startLocal, "day"),
    });
  },

  "change .js-event-duration, change .js-event-start-date, change .js-event-start-time"(
    this: EventEditData,
    _event,
    instance,
  ) {
    updateTimes(instance, true);
    const newStart = getEventStartMoment(instance);
    const newEnd = getEventEndMoment(instance);
    instance.state.set({
      timeChanged: !(
        newStart.isSame(moment.utc(this.startLocal), "minute") &&
        newEnd.isSame(moment.utc(this.endLocal), "minute")
      ),
    });
  },

  "change .js-event-end-time"(this: EventEditData, _event, instance) {
    updateTimes(instance, false);
    const newStart = getEventStartMoment(instance);
    const newEnd = getEventEndMoment(instance);
    instance.state.set({
      timeChanged: !(
        newStart.isSame(moment.utc(this.startLocal), "minute") &&
        newEnd.isSame(moment.utc(this.endLocal), "minute")
      ),
    });
  },

  "change .js-select-region"(_event, instance) {
    instance.selectedRegion.set(instance.$(".js-select-region").val() as string);
  },

  "change .js-update-replicas-infos"(event, instance) {
    instance.state.set("updateReplicasInfos", (event.target as HTMLInputElement).checked);
  },

  "change .js-update-replicas-time"(event, instance) {
    instance.state.set("updateReplicasTime", (event.target as HTMLInputElement).checked);
  },

  "change .js-update-changed-replicas-time"(event, instance) {
    instance.state.set("updateChangedReplicasTime", (event.target as HTMLInputElement).checked);
  },
});


export function Edit ({event}: {event:EventEditData }){
    const { t } = useTranslation();
  
    return  <form>
    <div className="edit-page">
      <h3>
        {{#if _id}}
          {t('course.event.edit.edit' ,'Edit event')}
        {{else}}
          {t('course.event.edit.add' ,'Create an event')}
        {{/if}}
      </h3>
      {{#unless hasParentCourse}}
        {{#unless _id}}
          {t('course.createEventInfo', 'Use this form to publish a singular, one-off, already organized event. Otherwise create or propose a course here:')}
          <a
            href="{{pathFor 'proposeCourse'}}">{t('menue.ProposeCourse', 'Propose a course')}</a>
        {{/unless}}
      {{/unless}}

      <div className="edit-page-header event-edit">
        {{#if showRegionTag}}
          {{> regionTag this}}
        {{/if}}
        <div className="mb-3">
          <label className="form-label">{t('course.event.edit.title' ,'Event title')}</label>
          <input type="text" className="js-event-title form-control form-control-lg" name="_"
                placeholder={t('event.title.placeholder', 'Write a catchy title here')}
                size={30} value="{{this.title}}" />
        </div>
        <div className="row">
          <div className="col-md mb-3 mb-md-0">
            <label className="form-label">{t('course.event.edit.date_start', 'Date')}</label>
            <div className="input-group">
              <label className="input-group-text" htmlFor="eventStartDate">
                <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
              </label>
              <input id="eventStartDate" type="text" className="form-control js-event-start-date"
                    value="{{localDate startLocal}}" {{disableForPast}}>
            </div>
          </div>
          <div className="col-md mb-3 mb-md-0">
            <label className="form-label">{t('course.event.edit.time_start' ,'Time start')}</label>
            <div className="input-group">
              <span className="input-group-text">
                <span className="fa-solid fa-hourglass-start fa-fw" aria-hidden="true"></span>
              </span>
              <input type="text" className="js-event-start-time form-control" size={5}
                    value="{{timeFormat startLocal}}" {{disableForPast}}>
            </div>
          </div>
          <div className="col-md js-time-end">
            <label className="form-label" style={{display:"none"}}>
              {t('course.event.edit.duration', 'Duration (in minutes)')}
              <button type="button" className="js-toggle-duration btn-icon" data-bs-toggle="tooltip"
                      data-bs-title={t('course.event.edit.switch_time_end', 'Switch to end time' )}>
                <span className="fa-solid fa-right-left"></span>
              </button>
            </label>
            <div className="input-group" style={{display:"none"}}>
              <span className="input-group-text">
                <span className="fa-solid fa-hourglass-end fa-fw" aria-hidden="true"></span>
              </span>
              <input type="number" className="js-event-duration form-control" id="editEventDuration"
                    value="" size={5} {{disableForPast}}/>
            </div>
            <label className="form-label">
              {t('course.event.edit.time_end', 'Time end')}
              <button type="button" className="js-toggle-duration btn-icon" data-bs-toggle="tooltip"
                      data-bs-title={t('course.event.edit.swich_duration', 'Switch to duration')}>
                <span className="fa-solid fa-right-left"></span>
              </button>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <span className="fa-solid fa-hourglass-end fa-fw" aria-hidden="true"></span>
              </span>
              <input type="text" className="js-event-end-time form-control" size={5}
                    value="{{timeFormat endLocal}}" {{disableForPast}}>
            </div>
          </div>
        </div>
      </div>
      <div className="edit-page-body event-edit">
        <div className="mb-3">
          <label className="form-label">{t('course.event.edit.desc' ,'Description')}</label>
          {{> richtext className="js-event-description" text=description placeholder=(i18n 'event.description.placeholder' 'Describe your event as accurately as possible. This helps people know how to prepare and what to expect from this meeting (e.g. level, prerequisites, activities, teaching methods, what to bring, etc.)') maxlength=PublicSettings.eventDescriptionMax}}
        </div>
        {{#unless isPrivate}}
          {{> pricePolicy dismissable=true wrap='mb-3'}}
        {{/unless}}

        {{#if showRegionSelection}}
          <div className="mb-3">
            <label className="form-label">{t('course.edit.region' ,'Region')}</label>
            <div className="input-group">
              <div className="input-group-text">
                <span className="fa-solid fa-location-dot" aria-hidden="true"></span>
              </div>
              <select className="js-select-region form-select" name='region'>
                <option className="select-placeholder" disabled
                        selected="{{#if isCurrentRegion 'all'}}selected{{/if}}" value=''>
                  {t('_selection.pleaseSelect'}}
                </option>
                {{#each region in regions}}
                  <option selected="{{#if isCurrentRegion region._id}}selected{{/if}}"
                          value='{{region._id}}'>
                    {{region.name}}
                  </option>
                {{/each}}
              </select>
            </div>
          </div>
        {{/if}}

        {{#if showVenueSelection}}
          {{> eventEditVenue venueEditAttr}}
          <div className="mb-3">
            <label className="form-label">
              {t('course.event.edit.room', 'Room')}
              <small> {t('_inputField.optional')}</small>
            </label>
            <div className="input-group" id="editform_room" name="editform_room">
              <span className="input-group-text">
                <span className="fa-solid fa-signs-post fa-fw" aria-hidden="true"></span>
              </span>
              <input type="text" className="js-event-room form-control" size={40} value="{{room}}"/>
            </div>
          </div>
        {{/if}}

        {{#if instance.customFields.length}}
          <div className="mb-3">
            {{> editCustomFields fields=(instance.customFields) values=customFields}}
          </div>
        {{/if}}

        <div className="mb-3">
          <div className="form-check">
            <input className="form-check-input js-check-no-rsvp" type="checkbox" value=""
                  id="eventEditNoRsvpCheck" {{noRsvp}}/>
            <label className="form-check-label" htmlFor="eventEditNoRsvpCheck">
              {t('event.edit.noRsvp' ,'No reservation required')}
              {{#if noRsvpChecked}}
                <span className="form-text d-block">
                  {t('event.edit.noRsvp.description', 'Registration for this event is disabled. You might want to explain why in the description.')}
                </span>
              {{/if}}
            </label>
          </div>
          {{#unless noRsvpChecked}}
            <label className="form-label">
              {t('course.event.edit.maxParticipants' ,'maximal number of participants')}
              <small> {t('_inputField.optional')}</small>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <span className="fa-solid fa-users fa-fw" aria-hidden="true"></span>
              </span>
              <input type="text" className="js-event-max-participants form-control" size={1}
                    value="{{maxParticipants}}"/>
            </div>
          {{/unless}}
        </div>

        <div className="mb-3">
          <div className="form-check">
            <input className="form-check-input js-check-event-internal" type="checkbox" value=""
                  id="eventEditInternalCheck" {{isInternal}} />
            <label className="form-check-label" htmlFor="eventEditInternalCheck">
              {t('event.edit.internal' ,'Hide on front page')}
              <span className="form-text d-block">
                {t('event.edit.internal.description', 'Show it only on group and venue pages')}
              </span>
            </label>
          </div>
          {{#if affectedReplicaCount}}
            <div className="form-check mt-2">
              <input className="form-check-input js-update-replicas-infos" type="checkbox"
                    name="updateReplicasInfo" value="" id="eventEditUpdateReplicasInfoCheck"/>
              <label className="form-check-label" htmlFor="eventEditUpdateReplicasInfoCheck">
                {t('event.edit.updateReplicasInfo', 'Update {COUNT, plural, one{info from later copy} other{info from # later copies} } as well.' ,{COUNT:affectedReplicaCount})}
              </label>
            </div>
            {{#if timeChanged}}
              <div className="form-check {{disabledIfDayChanged}}">
                <input className="form-check-input js-update-replicas-time" type="checkbox"
                      name="updateReplicasTime" value="" id="eventEditUpdateReplicasTimeCheck"
                      {{disabledIfDayChanged}}>
                <label className="form-check-label" htmlFor="eventEditUpdateReplicasTimeCheck">
                  {t('event.edit.updateReplicasTime' ,'Update time from {COUNT, plural, one{copy} other{copies} }',
                  {COUNT:affectedReplicaCount})}
                </label>
              </div>
              {{#if startDayChanged}}
                <div className="card text-white bg-danger mb-4">
                  <div className="card-body p-2">
                    <span className="fa-solid fa-triangle-exclamation fa-fw" aria-hidden="true"></span>
                    {t('event.edit.startDayChanged' ,'Updating the copies when the start day has been changed is not (yet) supported.')}
                  </div>
                </div>
              {{else}}
                {{#if changedReplicas.length}}
                  <div className="card mb-4 changed-replicas {{emphasizeClass}}">
                    <div className="card-header bg-warning">
                      <span className="fa-solid fa-triangle-exclamation fa-fw"
                            aria-hidden="true"></span>
                      {t('event.edit.changedReplicas.heading' ,'Found {NUM, plural, one{one copy which varies} other{# copies which vary} } in time', {NUM:changedReplicas.length})}
                    </div>
                    <div className="card-body">
                      {{#unless updateChangedReplicas}}
                        <span className="update-changed-replicas-help">
                          {t('event.edit.changedReplicas.body', "By default {NUM, plural, one{this copy} other{these copies} } won't be updated as {NUM, plural, one{it has} other{they have} } another time set than the original event:",{ NUM:changedReplicas.length})}
                        </span>
                      {{/unless}}
                      <ul>
                        {{#each replica in changedReplicas}}
                          <li>
                            <a href={Router.path('showEvent', replica)} target="_blank">
                              {{dateFormat replica.startLocal}}
                              -
                              {{replica.title}}

                              ({{timeFormat replica.startLocal}}
                              -
                              {{timeFormat replica.endLocal}})
                            </a>
                          </li>
                        {{/each}}
                      </ul>
                      <div className="form-check">
                        <input className="form-check-input js-update-changed-replicas-time"
                              type="checkbox" name="updateChangedReplicasTime" value=""
                              id="eventEditUpdateChangedReplicasTimeCheck"/>
                        <label className="form-check-label"
                              htmlFor="eventEditUpdateChangedReplicasTimeCheck">
                          {t('event.edit.updateChangedReplicasTime', 'Overwrite {NUM, plural, one{this events} other{these events} } time too',{ NUM:changedReplicas.length})}
                        </label>
                      </div>
                    </div>
                  </div>
                {{/if}}
              {{/if}}
            {{/if}}
          {{/if}}
          {{#if courseId}}
            <div className="form-check">
              {{#if new}}
                <input className="form-check-input js-check-notify" type="checkbox" value=""
                      id="eventEditCheckNotifyCheck" checked />
                <label className="form-check-label" htmlFor="eventEditCheckNotifyCheck">
                  {t('event.edit.notifyNewEvent', 'Notify all members of the "{COURSE}" course about this event.', {COURSE:course.name})}
                </label>
              {{else}}
                <input className="form-check-input js-check-notify" type="checkbox" value=""
                      id="eventEditCheckNotifyCheck" />
                <label className="form-check-label" htmlFor="eventEditCheckNotifyCheck">
                  {t('event.edit.notifyEditEvent' ,'Notify all members of the "{COURSE}" course about the changes you made.' ,{COURSE:course.name})}
                </label>
              {{/if}}
            </div>
          {{/if}}
          {{#if notifyChecked}}
            <label className="form-label">
              {t('course.event.edit.AddMessage' ,'Add message')}
              <small> {t('_inputField.optional')}</small>
            </label>
            <div className="input-group" id="editform_message" name="editform_message">
              <span className="input-group-text">
                <span className="fa-solid fa-pencil fa-fw" aria-hidden="true"></span>
              </span>
              <textarea rows={3} className="form-control js-event-add-message" maxlength={2000}
                        placeholder={t('event.edit.additionalMessage', 'If you feel good about doing so, describe what members of the course should know. (This message is only sent to the interested users and will not be visible in the event description afterwards.)')}></textarea>
            </div>
          {{/if}}
          {{#unless noRsvpChecked}}
            {{#if PublicSettings.feature.sendReminderIsEditable}}
              <div className="form-check">
                <input className="form-check-input js-check-event-send-reminder" type="checkbox"
                      value="" id="eventEditSendReminderCheck" {{sendReminder}} />
                <label className="form-check-label" htmlFor="eventEditSendReminderCheck">
                  {t('event.edit.sendReminder' ,'Send a reminder e-mail to all participants 24 hours before the event starts.')}
                </label>
              </div>
            {{/if}}
          {{/unless}}
        </div>

        <div className="form-actions">
          {{> buttonSave saving=saving}}
          {{> buttonCancel event="js-event-cancel"}}
        </div>
      </div>
    </div>
  </form>
}
