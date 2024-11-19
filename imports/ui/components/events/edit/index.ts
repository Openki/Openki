// NOTE All dates are in local time unless otherwise noted. Moment doesn't have
// a "timezone-unaware" mode. Thus Momentjs is kept in the belief that the dates
// are all UTC even though we mean local time. The reason for this is that
// the timezone might actually change when a different region is selected. We
// wouldn't want the time or even date field to change because of this switch.

import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
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
import "/imports/ui/components/events/edit-location";
import "/imports/ui/components/price-policy";
import "/imports/ui/components/regions/tag";
import "/imports/ui/components/edit-custom-fields";

import "./template.html";
import "./styles.scss";

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
    selectedLocation: ReactiveVar<Partial<EventVenueEntity>>;
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
  instance.selectedLocation = new ReactiveVar(
    instance.data.venue || ({} as Partial<EventVenueEntity>),
  );

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

    const defaultTeamGroup = getRegion()?.defaultTeamGroup;
    if (defaultTeamGroup) {
      groups.push(defaultTeamGroup);
    }

    if (courseId) {
      const course = Courses.findOne(courseId);
      if (!course) {
        throw new Error("Unexpected undefined: course");
      }
      groups.push(...course.groupOrganizers);
    }

    // remove double groups
    return [...new Set(groups)];
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
      venue: instance.selectedLocation.get(),
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
          if (_.intersection(user.badges, course.editors).length > 0) {
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
