import moment from "moment";
import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormControl } from "../../form-control";
import { LocalTime } from "/imports/utils/local-time";

export function EditStartEnd({
  startLocal,
  endLocal,
  disabled,
  onChange,
  errors,
}: {
  startLocal: string;
  endLocal: string;
  disabled?: boolean | undefined;
  onChange: (newValue: { startLocal: string; endLocal: string }) => void;
  errors: Partial<Record<"start", ReactNode>>;
}) {
  const { t } = useTranslation();
  const [durationEdit, setDurationEdit] = useState(false);

  function dateFormat(date: moment.Moment | string) {
    // the date string representation of dateTimes is the same for internal use (eg. to store in mongo) and
    // for date input. See `LocalTime` for more infos.
    return moment.utc(date).format(LocalTime.DateFormat);
  }

  function timeFormat(date: string) {
    // the time string representation of dateTimes is the same for internal use (eg. store in mongo) and
    // for time input. See `LocalTime` for more infos.
    return moment.utc(date).format(LocalTime.TimeFormat);
  }

  const start = moment.utc(startLocal);
  const end = moment.utc(endLocal);
  const duration = end.diff(start, "minutes");

  return (
    <>
      <div className="row">
        <div className="col-md mb-3 mb-md-0">
          <FormControl
            id="event-edit-start-date"
            type="date"
            label={t("group.event.edit.date_start", "Date")}
            prepend="fa-regular fa-calendar-days fa-fw"
            min={dateFormat(LocalTime.now())}
            value={startLocal}
            disabled={disabled}
            onChange={(value) => {
              const newStart = LocalTime.fromString(`${value}T${timeFormat(startLocal)}`);
              const newEnd = newStart.clone().add(duration, "minutes");
              onChange({
                startLocal: LocalTime.toString(newStart),
                endLocal: LocalTime.toString(newEnd),
              });
            }}
          />
        </div>
        <div className="col-md mb-3 mb-md-0">
          <FormControl
            id="events-edit-start-end-startTime"
            type="time"
            label={t("group.event.edit.time_start", "Time start")}
            prepend="fa-solid fa-hourglass-start fa-fw"
            error={!!errors.start}
            step={300}
            value={timeFormat(startLocal)}
            disabled={disabled}
            onChange={(value) => {
              const newStart = LocalTime.fromString(`${dateFormat(startLocal)}T${value}`);
              const newEnd = newStart.clone().add(duration, "minutes");
              onChange({
                startLocal: LocalTime.toString(newStart),
                endLocal: LocalTime.toString(newEnd),
              });
            }}
          />
        </div>
        <div className="col-md">
          {!durationEdit ? (
            <FormControl
              id="events-edit-start-end-endTime"
              type="time"
              label={
                <>
                  {t("group.event.edit.time_end", "Time end")}
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label={t("group.event.edit.swich_duration", "Switch to duration")}
                    data-bs-title={t("group.event.edit.swich_duration", "Switch to duration")}
                    onClick={() => {
                      setDurationEdit(true);
                    }}
                  >
                    <i className="fa-solid fa-right-left" />
                  </button>
                </>
              }
              prepend="fa-solid fa-hourglass-end fa-fw"
              value={timeFormat(endLocal)}
              step={300}
              disabled={disabled}
              onChange={(value) => {
                let newEnd = LocalTime.fromString(`${dateFormat(startLocal)}T${value}`);

                // If the end time is earlier than the start time, assume the event
                // spans into the next day. This might result in some weird behavior
                // around hour-lapses due to DST (where 1:30 may be 'later' than 2:00).
                if (newEnd.diff(start) < 0) {
                  newEnd = LocalTime.fromString(
                    `${dateFormat(start.clone().add(1, "day"))}T${value}`,
                  );
                }

                onChange({
                  startLocal,
                  endLocal: LocalTime.toString(newEnd),
                });
              }}
            />
          ) : (
            <FormControl
              id="edit-event-duration"
              type="integer"
              label={
                <>
                  {t("group.event.edit.duration", "Duration (in minutes)")}
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label={t("group.event.edit.switch_time_end", "Switch to end time")}
                    data-bs-title={t("group.event.edit.switch_time_end", "Switch to end time")}
                    onClick={() => setDurationEdit(false)}
                  >
                    <i className="fa-solid fa-right-left" />
                  </button>
                </>
              }
              prepend="fa-solid fa-hourglass-end fa-fw"
              step={5}
              value={duration}
              disabled={disabled}
              onChange={(value) => {
                const newEnd = start.clone().add(value, "minutes");
                onChange({
                  startLocal,
                  endLocal: LocalTime.toString(newEnd),
                });
              }}
            />
          )}
        </div>
      </div>
      {!!errors.start && <div className="text-danger">{errors.start}</div>}
    </>
  );
}
