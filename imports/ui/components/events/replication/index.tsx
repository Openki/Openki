import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Session } from "meteor/session";
import moment from "moment";

import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import * as Alert from "/imports/api/alerts/alert";

import { LocalTime } from "/imports/utils/local-time";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { PleaseLogin } from "/imports/ui/lib/please-login";

import { ButtonCancel, ButtonSave } from "/imports/ui/components/buttons";

import "./styles.scss";

const calcReplicaStartDate = (originalDate: moment.MomentInput) => {
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

template.events({
  "changeDate .js-replicate-datepick"(e, instance) {
    const pickDays = (e as unknown as { dates: number[] }).dates;

    const origin = moment(event.start).startOf("day");
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
      const startLocal = LocalTime.fromString(event.startLocal);
      const endLocal = LocalTime.fromString(event.endLocal);

      const replicaDays = instance.activeDays();
      let removed = 0;
      let responses = 0;
      for (const days of replicaDays) {
        /* create a new event for each time interval */
        const replicaEvent: EventsMethods.SaveFields = {
          startLocal: LocalTime.toString(moment(startLocal).add(days, "days")),
          endLocal: LocalTime.toString(moment(endLocal).add(days, "days")),
          title: event.title,
          description: event.description,
          room: event.room || "",
          region: event.region,
          groups: event.groups,
          // delegate the same replicaOf ID for this replica if the replicated event is also a replica
          replicaOf: event.replicaOf || event._id,
          internal: event.internal,
          sendReminder: event.sendReminder,
          noRsvp: event.noRsvp,
          maxParticipants: event.maxParticipants,
        };

        const { courseId, venue } = event;
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
            t("eventReplication.errWithReason", 'Could not create the copy on "{START}".', {
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
                t(
                  "event.replicate.successCondensed",
                  'Cloned event "{TITLE}" {NUM, plural, one{for} other{# times until} } {DATE}',
                  {
                    TITLE: event.title,
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
      startDate = calcReplicaStartDate(startDate);
    }

    instance.replicateStartDate.set(startDate);

    const endDate = moment(instance.$("#replicateEnd").val(), "L");
    if (!endDate.isValid()) {
      instance.calcDays.set([]);
      return;
    }

    instance.replicateEndDate.set(endDate);

    const frequency = instance.$(".js-replicate-frequency:checked").val() as string;

    instance.calcDays.set(getEventFrequency(moment(event.start), startDate, endDate, frequency));
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

export function Replication({ event }: { event: EventModel }) {
  const { t } = useTranslation();
  const { weekdayFormat, dateTimeLong, dateShort } = useDateTimeFormat();

  // Store the current date selection for replication
  // Days are stored as difference from the original day
  const [calcDays, setCalcDays] = useState<number[]>([]); // calculated from the dialog
  const [pickDays, setPickDays] = useState<number[]>([]); // picked in the calendar
  const [usingPicker, setUsingPicker] = new ReactiveVar(false);

  const activeDays = () => (usingPicker ? pickDays : calcDays);

  const [replicateStartDate, setReplicateStartDate] = useState(calcReplicaStartDate(event.start));
  const [replicateEndDate, setReplicateEndDate] = useState(
    calcReplicaStartDate(moment(event.start).add(1, "week")),
  );

  setCalcDays(
    getEventFrequency(moment(event.start), replicateStartDate, replicateEndDate, "weekly"),
  );

  function replicaStart() {
    const startDate = replicateStartDate;
    return calcReplicaStartDate(startDate).format("L");
  }

  function replicaEnd() {
    const endDate = replicateEndDate;
    return calcReplicaStartDate(endDate).format("L");
  }

  function replicateStartDay() {
    const startDate = replicateStartDate;
    return moment(startDate).format("ddd");
  }

  function replicateEndDay() {
    const endDate = replicateEndDate;
    return moment(endDate).format("ddd");
  }
  function replicaDateCount() {
    return activeDays().length;
  }

  function replicaDates() {
    const start = moment(event.start);
    return activeDays().map((days) => moment(start).add(days, "days"));
  }

  return (
    <div className="details-form event-replicate">
      <div className="row gap-3">
        <div className="col-md">
          <nav>
            <ul className="nav nav-tabs replica-nav-tabs">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="frequency-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#frequency"
                  type="button"
                  role="tab"
                  aria-controls="frequency"
                  aria-selected="true"
                >
                  <span className="fa-solid fa-list-ul fa-fw" aria-hidden="true"></span>
                  {t("event.replication.changeToPattern", "Select frequency")}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="datepicker-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#datepicker"
                  type="button"
                  role="tab"
                  aria-controls="datepicker"
                  aria-selected="false"
                >
                  <span className="fa-regular fa-calendar-check fa-fw" aria-hidden="true"></span>
                  {t("event.replication.changeToPicker", "Pick dates")}
                </button>
              </li>
            </ul>
          </nav>
          <div className="tab-content replica-tab-content">
            <div
              className="tab-pane"
              id="datepicker"
              role="tabpanel"
              aria-labelledby="datepicker-tab"
              tabIndex={0}
            >
              <div className="js-replicate-datepick"></div>
            </div>
            <div
              className="tab-pane mb-3 active"
              id="frequency"
              role="tabpanel"
              aria-labelledby="frequency-tab"
              tabIndex={0}
            >
              <label className="form-label" htmlFor="replicateStart">
                {t("event.replication.interval.start", "Interval Start")}
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
                </span>
                <input
                  type="text"
                  className="form-control js-replicate-date js-update-replicas"
                  id="replicateStart"
                  size={8}
                  value={replicaStart()}
                />
                <span className="replica-date-weekday">{replicateStartDay()}</span>
              </div>
              <label className="form-label" htmlFor="replicateEnd">
                {t("event.replication.interval.end", "Interval End")}
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
                </span>
                <input
                  type="text"
                  className="form-control js-replicate-date js-update-replicas"
                  id="replicateEnd"
                  size={8}
                  value={replicaEnd()}
                />
                <span className="replica-date-weekday">{replicateEndDay()}</span>
              </div>
              <label className="form-label" htmlFor="replicateFrequency">
                {t("event.replication.repeat", "Repeat")}
              </label>
              <div className="form-check">
                <input
                  className="form-check-input js-replicate-frequency js-update-replicas"
                  type="radio"
                  name="replicateFrequency"
                  id="replicateFrequencyOnce"
                  value="once"
                />
                <label className="form-check-label" htmlFor="replicateFrequencyOnce">
                  {t("event.replication.freq.once", "once")}
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input js-replicate-frequency js-update-replicas"
                  type="radio"
                  name="replicateFrequency"
                  id="replicateFrequencyDaily"
                  value="daily"
                />
                <label className="form-check-label" htmlFor="replicateFrequencyDaily">
                  {t("event.replication.freq.daily", "every day")}
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input js-replicate-frequency js-update-replicas"
                  type="radio"
                  name="replicateFrequency"
                  id="replicateFrequencyWeekly"
                  value="weekly"
                  checked
                />
                <label className="form-check-label" htmlFor="replicateFrequencyWeekly">
                  {t("event.replication.freq.weekly", "once a week")}
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input js-replicate-frequency js-update-replicas"
                  type="radio"
                  name="replicateFrequency"
                  id="replicateFrequencyBiWeekly"
                  value="biWeekly"
                />
                <label className="form-check-label" htmlFor="replicateFrequencyBiWeekly">
                  {t("event.replication.freq.biWeekly", "every 2 weeks")}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md">
          {replicaDateCount() ? (
            <>
              <label className="form-label">
                {t(
                  "event.replication.createText",
                  "Create {COUNT, plural, one{a copy on this date} other{# copies on this dates} }",
                  { COUNT: replicaDateCount },
                )}
              </label>
              <div className="replica-event-captions row">
                {replicaDates().map((date) => (
                  <div className="event-caption col-3" title={dateTimeLong(date)}>
                    <div className="event-caption-header-wrap">
                      <div className="event-caption-header">
                        <span className="fa-solid fa-map-pin"></span>
                        {weekdayFormat(date)}
                        <div className="event-caption-pseudoborder"></div>
                      </div>
                    </div>
                    <div className="event-caption-body-wrap">
                      <div className="event-caption-body">{dateShort(date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <label className="form-label">
                {t("event.replication.noDates", "No date(s) selected")}
              </label>
              <div className="replica-event-captions">
                <div className="event-caption event-caption-placeholder">
                  <div className="event-caption-header-wrap">
                    <div className="event-caption-header">
                      <span className="fa-solid fa-map-pin"></span>
                      <div className="event-caption-pseudoborder"></div>
                    </div>
                  </div>
                  <div className="event-caption-body-wrap">
                    <div className="event-caption-body">{dateShort(event.start)}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="replicate-actions">
        {!!replicaDateCount() && <ButtonSave event="js-replicate-btn" />}
        <ButtonCancel event="js-cancel-replication" />
      </div>
    </div>
  );
}
