import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";

import { LocalTime } from "/imports/utils/local-time";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { ButtonCancel, ButtonSave } from "../../Buttons";
import { FormCheckGroup } from "../../FormCheckGroup";
import { DateSelect } from "../../date-select";
import { Notify } from "../Notify";

import { todayOrAfter } from "../../../lib/todayOrAfter";

import "./styles.scss";

const getEventFrequency = (
  originStart: moment.Moment,
  startDate: moment.Moment,
  endDate: moment.Moment,
  frequency: string,
) => {
  const frequencies: Record<
    string,
    {
      unit: moment.unitOfTime.DurationConstructor;
      interval: moment.DurationInputArg1;
    }
  > = {
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

export interface Props {
  event: EventModel;
  afterSave: () => void;
  onCancel: () => void;
}

export function EventReplication({ event, afterSave, onCancel }: Props) {
  const { t } = useTranslation();
  const { dayOfWeek, dateTimeLong, dateShort } = useDateTimeFormat();
  const elementRef = useRef<HTMLDivElement>(null);

  const [usingPicker, setUsingPicker] = useState(false);
  const [replicateFrequency, setReplicateFrequency] = useState("weekly");
  const [replicateStartDate, setReplicateStartDate] = useState(todayOrAfter(event.start));
  const [replicateEndDate, setReplicateEndDate] = useState(
    todayOrAfter(moment(event.start).add(1, "week")),
  );
  // Store the current date selection for replication
  // Days are stored as difference from the original day
  // calculated from the dialog
  const [calcDays, setCalcDays] = useState<number[]>(
    getEventFrequency(
      moment(event.start),
      replicateStartDate,
      replicateEndDate,
      replicateFrequency,
    ),
  );
  // picked in the calendar
  const [pickDays, setPickDays] = useState<number[]>([]);
  const activeDays = () => (usingPicker ? pickDays : calcDays);

  // Sending an event notification is only possible when the event is
  // attached to a group. Otherwise there is nobody to inform.
  const [notifyChecked, setNotifyChecked] = useState(!!event.groupId && "new" in event);
  const [addNotificationMessage, setAddNotificationMessage] = useState("");

  function replicaDateCount() {
    return activeDays().length;
  }

  function replicaDates() {
    const start = moment(event.start);
    return activeDays().map((days) => moment(start).add(days, "days"));
  }

  useEffect(() => {
    setCalcDays(
      getEventFrequency(
        moment(event.start),
        replicateStartDate,
        replicateEndDate,
        replicateFrequency,
      ),
    );
  }, [event.start, replicateStartDate, replicateEndDate, replicateFrequency]);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }
    $('button[data-bs-toggle="tab"]', elementRef.current).on("show.bs.tab", (e) => {
      const targetHref = $(e.target).attr("data-bs-target");
      setUsingPicker(targetHref === "#datepicker");
    });
  }, []);

  return (
    <div className="details-form event-replicate" ref={elementRef}>
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
                  <i className="fa-solid fa-list-ul fa-fw" />
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
                  <i className="fa-regular fa-calendar-check fa-fw" />
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
              <DateSelect
                multiple
                value={[]}
                onChange={(newValues) => {
                  const origin = moment(event.start).startOf("day");
                  const days = newValues.map((date) => moment(date).diff(origin, "days"));
                  setPickDays(days);
                }}
              />
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
              <DateSelect
                id="replicateStart"
                value={replicateStartDate}
                onChange={(newValue) => {
                  let startDate = newValue;
                  if (!startDate.isValid()) {
                    setCalcDays([]);
                    return;
                  }
                  if (startDate.isBefore(moment())) {
                    // Jump forward in time so we don't have to look at all these old dates
                    startDate = todayOrAfter(startDate);
                  }

                  setReplicateStartDate(startDate);
                }}
              />
              <label className="form-label" htmlFor="replicateEnd">
                {t("event.replication.interval.end", "Interval End")}
              </label>
              <DateSelect
                id="replicateEnd"
                value={replicateEndDate}
                onChange={(newValue) => {
                  const endDate = newValue;
                  if (!endDate.isValid()) {
                    setCalcDays([]);
                    return;
                  }

                  setReplicateEndDate(endDate);
                }}
              />
              <FormCheckGroup
                id="replicateFrequency"
                type="radio"
                label={t("event.replication.repeat", "Repeat")}
                options={{
                  once: t("event.replication.freq.once", "once"),
                  daily: t("event.replication.freq.daily", "every day"),
                  weekly: t("event.replication.freq.weekly", "once a week"),
                  biWeekly: t("event.replication.freq.biWeekly", "every 2 weeks"),
                }}
                value={replicateFrequency}
                onChange={(value) => {
                  setReplicateFrequency(value);
                }}
              />
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
                  { COUNT: replicaDateCount() },
                )}
              </label>
              <div className="replica-event-captions row">
                {replicaDates().map((date) => (
                  <div
                    key={date.valueOf()}
                    className="event-caption col-3"
                    title={dateTimeLong(date)}
                  >
                    <div className="event-caption-header-wrap">
                      <div className="event-caption-header">
                        {dayOfWeek(date)}
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
      <div className="my-3">
        <Notify
          event={event}
          isNew
          checked={notifyChecked}
          message={addNotificationMessage}
          onToggle={(v) => setNotifyChecked(v)}
          onMessageChange={(v) => {
            setAddNotificationMessage(v);
          }}
        />
      </div>
      <div className="replicate-actions">
        {!!replicaDateCount() && (
          <ButtonSave
            id="events-replication-save"
            needsLogin
            onClick={async () => {
              const startLocal = LocalTime.fromString(event.startLocal);
              const endLocal = LocalTime.fromString(event.endLocal);

              const replicaDays = activeDays();
              let created = 0;
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
                  organizations: event.organizations,
                  // delegate the same replicaOf ID for this replica if the replicated event is also a replica
                  replicaOf: event.replicaOf || event._id,
                  internal: event.internal,
                  sendReminder: event.sendReminder,
                  noRsvp: event.noRsvp,
                  maxParticipants: event.maxParticipants,
                };

                const { groupId, venue } = event;
                if (venue) {
                  replicaEvent.venue = venue;
                }
                if (groupId) {
                  replicaEvent.groupId = groupId;
                }

                try {
                  await EventsMethods.save(
                    "",
                    replicaEvent,
                    undefined,
                    undefined,
                    undefined,
                    notifyChecked && created === 0,
                    addNotificationMessage,
                  );
                  created += 1;
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
                    if (created) {
                      const start = moment(replicaEvent.startLocal).format("llll");
                      Alert.success(
                        t(
                          "event.replicate.successCondensed",
                          'Cloned event "{TITLE}" {NUM, plural, one{for} other{# times until} } {DATE}',
                          {
                            TITLE: event.title,
                            NUM: created,
                            DATE: start,
                          },
                        ),
                      );
                    }
                    if (created === responses) {
                      afterSave();
                    }
                  }
                }
              }
            }}
          />
        )}
        <ButtonCancel id="events-replication-cancel" onClick={onCancel} />
      </div>
    </div>
  );
}
