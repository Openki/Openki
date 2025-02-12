import { ReactiveVar } from "meteor/reactive-var";
import { i18n } from "/imports/startup/both/i18next";
import { Session } from "meteor/session";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import * as Alert from "/imports/api/alerts/alert";

import { LocalTime } from "/imports/utils/local-time";

import { PleaseLogin } from "/imports/ui/lib/please-login";

import "/imports/ui/components/buttons";

import "./template.html";
import "./styles.scss";

const replicaStartDate = (originalDate: moment.MomentInput) => {
  const originalMoment = moment(originalDate);
  const startMoment = moment.max(originalMoment, moment());
  startMoment.day(originalMoment.day());
  return startMoment;
};

const getEventFrequency = (
  originStart: moment.Moment,
  startDate: moment.Moment,
  endDate: moment.Moment,
  frequency: string,
) => {
  const frequencies: {
    [name: string]: {
      unit: moment.unitOfTime.DurationConstructor;
      interval: moment.DurationInputArg1;
    };
  } = {
    once: { unit: "days", interval: 1 },
    daily: { unit: "days", interval: 1 },
    weekly: { unit: "weeks", interval: 1 },
    biWeekly: { unit: "weeks", interval: 2 },
  };

  if (frequencies[frequency] === undefined) {
    return [];
  }
  const { unit, interval } = frequencies[frequency];

  const originDay = moment(originStart).startOf("day");

  const now = moment();
  const repStart = moment(startDate).startOf("day");
  const days = [];
  const repLimit = 52;

  while (!repStart.isAfter(endDate)) {
    const daysFromOriginal = repStart.diff(originDay, "days");
    if (daysFromOriginal !== 0 && repStart.isAfter(now)) {
      days.push(daysFromOriginal);
      if (frequency === "once" || days.length >= repLimit) {
        break;
      }
    }

    repStart.add(interval, unit);
  }

  return days;
};

const Template = TemplateAny as TemplateStaticTyped<
  "eventReplication",
  EventModel,
  {
    calcDays: ReactiveVar<number[]>;
    pickDays: ReactiveVar<number[]>;
    usingPicker: ReactiveVar<boolean>;
    activeDays: () => number[];
    replicateStartDate: ReactiveVar<moment.Moment>;
    replicateEndDate: ReactiveVar<moment.Moment>;
  }
>;

const template = Template.eventReplication;

template.onCreated(function () {
  const instance = this;

  instance.busy(false);

  // Store the current date selection for replication
  // Days are stored as difference from the original day
  instance.calcDays = new ReactiveVar([]); // calculated from the dialog
  instance.pickDays = new ReactiveVar([]); // picked in the calendar
  instance.usingPicker = new ReactiveVar(false);

  instance.activeDays = () =>
    instance.usingPicker.get() ? instance.pickDays.get() : instance.calcDays.get();

  const { data } = instance;
  instance.replicateStartDate = new ReactiveVar(replicaStartDate(data.start));
  instance.replicateEndDate = new ReactiveVar(replicaStartDate(moment(data.start).add(1, "week")));

  instance.calcDays.set(
    getEventFrequency(
      moment(instance.data.start),
      instance.replicateStartDate.get(),
      instance.replicateEndDate.get(),
      "weekly",
    ),
  );
});

template.onRendered(function () {
  const instance = this;

  const pickDays: Date[] = [];

  instance.autorun(() => {
    Session.get("locale");

    instance.$(".js-replicate-date").datepicker("destroy");
    instance.$(".js-replicate-date").datepicker({
      weekStart: moment.localeData().firstDayOfWeek(),
      language: moment.locale(),
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

    instance.$(".js-replicate-datepick").datepicker("destroy");
    instance.$(".js-replicate-datepick").datepicker({
      weekStart: moment.localeData().firstDayOfWeek(),
      language: moment.locale(),
      multidate: true,
      multidateSeparator: ", ",
      todayHighlight: true,
      startDate: new Date(),
    });

    instance.$(".js-replicate-datepick").datepicker("setDates", pickDays);
  });
});

template.helpers({
  replicaStart() {
    const startDate = Template.instance().replicateStartDate.get();
    return replicaStartDate(startDate).format("L");
  },

  replicaEnd() {
    const endDate = Template.instance().replicateEndDate.get();
    return replicaStartDate(endDate).format("L");
  },

  replicateStartDay() {
    const startDate = Template.instance().replicateStartDate.get();
    return moment(startDate).format("ddd");
  },

  replicateEndDay() {
    const endDate = Template.instance().replicateEndDate.get();
    return moment(endDate).format("ddd");
  },
  replicaDateCount: () => Template.instance().activeDays().length,

  replicaDates() {
    const event = Template.instance().data;
    const start = moment(event.start);
    return Template.instance()
      .activeDays()
      .map((days) => moment(start).add(days, "days"));
  },
});

template.events({
  "changeDate .js-replicate-datepick"(event, instance) {
    const pickDays = (event as unknown as { dates: number[] }).dates;

    const origin = moment(instance.data.start).startOf("day");
    const days = pickDays.map((date) => moment(date).diff(origin, "days"));
    instance.pickDays.set(days);
  },

  'show.bs.tab button[data-bs-toggle="tab"]'(event, instance) {
    const targetHref = $(event.target).attr("data-bs-target");
    instance.usingPicker.set(targetHref === "#datepicker");
  },

  "click .js-replicate-btn"(_event, instance) {
    instance.busy("saving");
    PleaseLogin(instance, async () => {
      const startLocal = LocalTime.fromString(instance.data.startLocal);
      const endLocal = LocalTime.fromString(instance.data.endLocal);

      const replicaDays = instance.activeDays();
      let removed = 0;
      let responses = 0;
      for (const days of replicaDays) {
        /* create a new event for each time interval */
        const replicaEvent: EventsMethods.SaveFields = {
          startLocal: LocalTime.toString(moment(startLocal).add(days, "days")),
          endLocal: LocalTime.toString(moment(endLocal).add(days, "days")),
          title: instance.data.title,
          description: instance.data.description,
          room: instance.data.room || "",
          region: instance.data.region,
          groups: instance.data.groups,
          // delegate the same replicaOf ID for this replica if the replicated event is also a replica
          replicaOf: instance.data.replicaOf || instance.data._id,
          internal: instance.data.internal,
          sendReminder: instance.data.sendReminder,
          noRsvp: instance.data.noRsvp,
          maxParticipants: instance.data.maxParticipants,
        };

        const { courseId, venue } = instance.data;
        if (venue) {
          replicaEvent.venue = venue;
        }
        if (courseId) {
          replicaEvent.courseId = courseId;
        }

        try {
          // eslint-disable-next-line no-await-in-loop
          await EventsMethods.save("", replicaEvent);
          removed += 1;
        } catch (error) {
          const start = moment(replicaEvent.startLocal).format("llll");
          Alert.serverError(
            error,
            i18n("eventReplication.errWithReason", 'Could not create the copy on "{START}".', {
              START: start,
            }),
          );
        } finally {
          responses += 1;
          if (responses === replicaDays.length) {
            instance.busy(false);
            if (removed) {
              const start = moment(replicaEvent.startLocal).format("llll");
              Alert.success(
                i18n(
                  "event.replicate.successCondensed",
                  'Cloned event "{TITLE}" {NUM, plural, one{for} other{# times until} } {DATE}',
                  {
                    TITLE: instance.data.title,
                    NUM: removed,
                    DATE: start,
                  },
                ),
              );
            }
            if (removed === responses) {
              const parentInstance = instance.parentInstance() as any;
              parentInstance.replicating.set(false);
              parentInstance.collapse();
            }
          }
        }
      }
    });
  },

  "change .js-update-replicas, keyup .js-update-replicas"(_event, instance) {
    let startDate = moment(instance.$("#replicateStart").val(), "L");
    if (!startDate.isValid()) {
      instance.calcDays.set([]);
      return;
    }
    if (startDate.isBefore(moment())) {
      // Jump forward in time so we don't have to look at all these old dates
      startDate = replicaStartDate(startDate);
    }

    instance.replicateStartDate.set(startDate);

    const endDate = moment(instance.$("#replicateEnd").val(), "L");
    if (!endDate.isValid()) {
      instance.calcDays.set([]);
      return;
    }

    instance.replicateEndDate.set(endDate);

    const frequency = instance.$(".js-replicate-frequency:checked").val() as string;

    instance.calcDays.set(
      getEventFrequency(moment(instance.data.start), startDate, endDate, frequency),
    );
  },

  "mouseover .js-replicate-btn"(_event, instance) {
    instance.$(".replica-event-captions").addClass("highlighted");
  },

  "mouseout .js-replicate-btn"(_event, instance) {
    instance.$(".replica-event-captions").removeClass("highlighted");
  },

  "click .js-cancel-replication"(_event, instance) {
    const parentInstance = instance.parentInstance() as any;
    parentInstance.replicating.set(false);
    parentInstance.collapse();
  },
});


export function Replication(){
  return   <div className="details-form event-replicate">
  <div className="row gap-3">
    <div className="col-md">
      <nav>
        <ul className="nav nav-tabs replica-nav-tabs">
          <li className="nav-item" role="presentation">
            <button className="nav-link active" id="frequency-tab" data-bs-toggle="tab"
                    data-bs-target="#frequency" type="button" role="tab" aria-controls="frequency"
                    aria-selected="true">
              <span className="fa-solid fa-list-ul fa-fw" aria-hidden="true"></span>
              {{i18n 'event.replication.changeToPattern' 'Select frequency'}}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button className="nav-link" id="datepicker-tab" data-bs-toggle="tab"
                    data-bs-target="#datepicker" type="button" role="tab"
                    aria-controls="datepicker" aria-selected="false">
              <span className="fa-regular fa-calendar-check fa-fw" aria-hidden="true"></span>
              {{i18n 'event.replication.changeToPicker' 'Pick dates'}}
            </button>
          </li>
        </ul>
      </nav>
      <div className="tab-content replica-tab-content">
        <div className="tab-pane" id="datepicker" role="tabpanel" aria-labelledby="datepicker-tab"
             tabIndex={0}>
          <div className="js-replicate-datepick"></div>
        </div>
        <div className="tab-pane mb-3 active" id="frequency" role="tabpanel"
             aria-labelledby="frequency-tab" tabindex="0">
          <label className="form-label" for="replicateStart">
            {{i18n 'event.replication.interval.start' 'Interval Start'}}
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
            </span>
            <input type="text" className="form-control js-replicate-date js-update-replicas"
                   id="replicateStart" size="8" value="{{replicaStart}}"/>
            <span className="replica-date-weekday">{{replicateStartDay}}</span>
          </div>
          <label className="form-label" for="replicateEnd">
            {{i18n 'event.replication.interval.end' 'Interval End'}}
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
            </span>
            <input type="text" className="form-control js-replicate-date js-update-replicas"
                   id="replicateEnd" size={8 }value="{{replicaEnd}}" />
            <span className="replica-date-weekday">{{replicateEndDay}}</span>
          </div>
          <label className="form-label" for="replicateFrequency">
            {{i18n 'event.replication.repeat' 'Repeat'}}
          </label>
          <div className="form-check">
            <input className="form-check-input js-replicate-frequency js-update-replicas" type="radio"
                   name="replicateFrequency" id="replicateFrequencyOnce" value="once" />
            <label className="form-check-label" for="replicateFrequencyOnce">
              {{i18n 'event.replication.freq.once' 'once'}}
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input js-replicate-frequency js-update-replicas" type="radio"
                   name="replicateFrequency" id="replicateFrequencyDaily" value="daily" />
            <label className="form-check-label" for="replicateFrequencyDaily">
              {{i18n 'event.replication.freq.daily' 'every day'}}
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input js-replicate-frequency js-update-replicas" type="radio"
                   name="replicateFrequency" id="replicateFrequencyWeekly" value="weekly" checked/>
            <label className="form-check-label" for="replicateFrequencyWeekly">
              {{i18n 'event.replication.freq.weekly' 'once a week'}}
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input js-replicate-frequency js-update-replicas" type="radio"
                   name="replicateFrequency" id="replicateFrequencyBiWeekly" value="biWeekly"/>
            <label className="form-check-label" for="replicateFrequencyBiWeekly">
              {{i18n 'event.replication.freq.biWeekly' 'every 2 weeks'}}
            </label>
          </div>
        </div>
      </div>
    </div>
    <div className="col-md">
      {{#if replicaDateCount}}
        <label className="form-label">
          {{i18n 'event.replication.createText' 'Create {COUNT, plural, one{a copy on this date} other{# copies on this dates} }' COUNT=replicaDateCount}}
        </label>
        <div className="replica-event-captions row">
          {{#each date in replicaDates}}
            <div className="event-caption col-3" title="{{dateTimeLong date}}">
              <div className="event-caption-header-wrap">
                <div className="event-caption-header">
                  <span className="fa-solid fa-map-pin"></span>
                  {{weekdayFormat date}}
                  <div className="event-caption-pseudoborder"></div>
                </div>
              </div>
              <div className="event-caption-body-wrap">
                <div className="event-caption-body">
                  {{dateShort date}}
                </div>
              </div>
            </div>
          {{/each}}
        </div>
      {{else}}
        <label
               className="form-label">{{i18n 'event.replication.noDates' 'No date(s) selected'}}</label>
        <div className="replica-event-captions">
          <div className="event-caption event-caption-placeholder">
            <div className="event-caption-header-wrap">
              <div className="event-caption-header">
                <span className="fa-solid fa-map-pin"></span>
                <div className="event-caption-pseudoborder"></div>
              </div>
            </div>
            <div className="event-caption-body-wrap">
              <div className="event-caption-body">
                {{dateShort this.start}}
              </div>
            </div>
          </div>
        </div>
      {{/if}}
    </div>
  </div>
  <div className="replicate-actions">
    {{#if replicaDateCount}}
      {{> buttonSave event='js-replicate-btn'}}
    {{/if}}
    {{> buttonCancel event='js-cancel-replication'}}
  </div>
</div>
}
