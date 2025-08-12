import moment from "moment";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LocalTime } from "/imports/utils/local-time";
import * as Tooltips from "/imports/utils/Tooltips";

export function EditStartEnd({
  startLocal,
  endLocal,
  disabled,
  onChange,
}: {
  startLocal: string;
  endLocal: string;
  disabled: boolean;
  onChange: (newValue: { startLocal: string; endLocal: string }) => void;
}) {
  const { t } = useTranslation();
  const [durationEdit, setDurationEdit] = useState(false);
  const dateElementRef = useRef(null);

  function localDate(date: string) {
    return moment.utc(date).format("L");
  }

  function timeFormat(date: string) {
    return moment.utc(date).format("HH:mm");
  }

  const start = moment.utc(startLocal);
  const end = moment.utc(endLocal);
  const duration = end.diff(start, "minutes");

  useEffect(() => {
    const desiredLocale = Session.get("locale");

    if (!desiredLocale || !dateElementRef.current) {
      // if nothing set we wait for a change
      return;
    }

    const language = desiredLocale.substring(0, 2);

    const $dateInput = $(dateElementRef.current);

    // remove, re-add the datepicker when the locale changed
    $dateInput.datepicker("destroy");

    // I don't know why, but language: moment.locale() does not work here.
    // So instead we clobber the 'en' settings with settings for the
    // selected language.
    $dateInput
      .datepicker({
        language,
        weekStart: moment.localeData().firstDayOfWeek(),
        autoclose: true,
        startDate: new Date(),
        format: {
          toDisplay(date) {
            return localDate(date);
          },
          toValue(date) {
            return moment.utc(date, "L").toDate();
          },
        },
      })
      .on("changeDate", function (ev) {
        const newStart = LocalTime.fromString(
          (ev as any).currentTarget.value,
          timeFormat(startLocal),
        );
        const newEnd = newStart.clone().add(duration, "minutes");
        onChange({
          startLocal: LocalTime.toString(newStart),
          endLocal: LocalTime.toString(newEnd),
        });
      });
  });

  return (
    <div className="row">
      <div className="col-md mb-3 mb-md-0">
        <label className="form-label">{t("course.event.edit.date_start", "Date")}</label>
        <div className="input-group">
          <label className="input-group-text" htmlFor="eventStartDate">
            <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
          </label>
          <input
            id="eventStartDate"
            ref={dateElementRef}
            type="text"
            className="form-control js-event-start-date"
            value={localDate(startLocal)}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="col-md mb-3 mb-md-0">
        <label className="form-label">{t("course.event.edit.time_start", "Time start")}</label>
        <div className="input-group">
          <span className="input-group-text">
            <span className="fa-solid fa-hourglass-start fa-fw" aria-hidden="true"></span>
          </span>
          <input
            type="time"
            className="js-event-start-time form-control"
            step={300}
            value={timeFormat(startLocal)}
            disabled={disabled}
            onChange={(ev) => {
              const newStart = LocalTime.fromString(localDate(startLocal), ev.currentTarget.value);
              const newEnd = newStart.clone().add(duration, "minutes");
              onChange({
                startLocal: LocalTime.toString(newStart),
                endLocal: LocalTime.toString(newEnd),
              });
            }}
          />
        </div>
      </div>
      <div className="col-md js-time-end">
        {!durationEdit ? (
          <>
            <label className="form-label">
              {t("course.event.edit.time_end", "Time end")}
              <button
                type="button"
                className="js-toggle-duration btn-icon"
                data-bs-title={t("course.event.edit.swich_duration", "Switch to duration")}
                onClick={() => {
                  Tooltips.hide();
                  setDurationEdit(true);
                }}
              >
                <span className="fa-solid fa-right-left"></span>
              </button>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <span className="fa-solid fa-hourglass-end fa-fw" aria-hidden="true"></span>
              </span>
              <input
                type="time"
                className="js-event-end-time form-control"
                value={timeFormat(endLocal)}
                step={300}
                disabled={disabled}
                onChange={(ev) => {
                  let newEnd = LocalTime.fromString(localDate(startLocal), ev.currentTarget.value);

                  // If the end time is earlier than the start time, assume the event
                  // spans into the next day. This might result in some weird behavior
                  // around hour-lapses due to DST (where 1:30 may be 'later' than 2:00).
                  if (newEnd.diff(start) < 0) {
                    newEnd = LocalTime.fromString(
                      start.clone().add(1, "day").format("L"),
                      ev.currentTarget.value,
                    );
                  }

                  onChange({
                    startLocal,
                    endLocal: LocalTime.toString(newEnd),
                  });
                }}
              />
            </div>
          </>
        ) : (
          <>
            <label className="form-label">
              {t("course.event.edit.duration", "Duration (in minutes)")}
              <button
                type="button"
                className="js-toggle-duration btn-icon"
                data-bs-title={t("course.event.edit.switch_time_end", "Switch to end time")}
                onClick={() => {
                  Tooltips.hide();
                  setDurationEdit(false);
                }}
              >
                <span className="fa-solid fa-right-left"></span>
              </button>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <span className="fa-solid fa-hourglass-end fa-fw" aria-hidden="true"></span>
              </span>
              <input
                type="number"
                className="js-event-duration form-control"
                id="editEventDuration"
                value={duration}
                step={5}
                disabled={disabled}
                onChange={(ev) => {
                  const newEnd = start.clone().add(ev.currentTarget.valueAsNumber, "minutes");
                  onChange({
                    startLocal,
                    endLocal: LocalTime.toString(newEnd),
                  });
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
