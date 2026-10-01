import React, { useRef, useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { Session } from "meteor/session";

import { EventEntity, EventModel, Events, OEvent } from "/imports/api/events/events";
import { VenueModel } from "/imports/api/venues/venues";

import { useEventListener } from "/imports/utils/useEventListener";
import { textPlain } from "/imports/utils/html-tools";
import { useDateTimeFormat } from "/imports/ui/hooks/useDateTimeFormat";
import { useCurrentRouteName } from "/imports/utils/react-meteor-router";
import { cx } from "/imports/utils/cx";

import "./styles.scss";

export interface RelStartEnd {
  relStart: number;
  relEnd: number;
}

export interface Props {
  control: boolean;
  day: number;
  dayLimit: number | undefined;
  filter: ReturnType<(typeof Events)["Filtering"]>;
  now: number;
  days: ({
    moment: moment.Moment;
  } & RelStartEnd)[];
  hours: ({
    moment: moment.Moment;
  } & RelStartEnd)[];
  grouped: {
    perRoom: {
      room: string;
      venue: VenueModel;
      rows: (EventModel & RelStartEnd)[][];
    }[];
    venue: VenueModel;
  }[];
  future_length: number;
}

function position(rel: RelStartEnd) {
  return { left: `${rel.relStart * 100}%`, right: `${rel.relEnd * 100}%` };
}

function Event({ entry }: { entry: OEvent & EventEntity & RelStartEnd }) {
  const { t } = useTranslation();
  const { timeFormat } = useDateTimeFormat();
  const [active, setActive] = useState(false);

  const elementRef = useRef<HTMLDivElement>(null);
  useEventListener(document, "click", (ev) => {
    let targetEl = ev.target; // clicked element
    do {
      if (targetEl === elementRef.current) {
        // This is a click inside
        setActive(!active);
        return;
      }
      // Go up the DOM
      targetEl = (targetEl as Node).parentNode;
    } while (targetEl);
    // This is a click outside.
    setActive(false);
  });

  return (
    <div
      className={cx(
        "timetable-event",
        entry.relStart > 0.5 && "timetable-event-right",
        active && "active",
      )}
      style={position(entry)}
    >
      <div
        ref={elementRef}
        className={cx("timetable-event-title", entry.canceled && "timetable-event-title-canceled")}
      >
        {entry.title}
      </div>
      <div className="timetable-event-time">
        <i className="fa-regular fa-clock fa-fw" />
        {timeFormat(entry.start)} - {timeFormat(entry.end)}
      </div>
      <div className="timetable-event-description">
        {entry.canceled ? (
          <span className="timetable-event-canceled">{t("_event.state.canceled")}</span>
        ) : (
          entry.isFullyBooked() && (
            <span className="timetable-event-fully-booked">{t("_event.state.fullyBooked")}</span>
          )
        )}
        <p>{textPlain(entry.description)}</p>
        <a className="btn btn-outline-dark" href={Router.url("showEvent", entry)}>
          {t("kiosk.timetable.showDetails", "Show details")}
        </a>
      </div>
    </div>
  );
}

export function KioskTimetablePage(props: Props) {
  const { t } = useTranslation();
  const routeName = useCurrentRouteName();

  function isRoomRow(room: string, index: number) {
    return !!room && index !== 0;
  }

  function showDay(m: moment.Moment) {
    return m.locale(Session.get("timeLocale") || "en").format("dddd, LL");
  }
  function showHour(m: moment.Moment) {
    return m.locale(Session.get("timeLocale") || "en").format("H");
  }
  function controlDay(add: number) {
    const query: Record<string, string> = props.filter.toParams();

    query.control = props.control ? "1" : "0";
    query.day = `${props.day + add}`;

    return Router.url(routeName, {}, { query });
  }

  return (
    <div className="container-fluid timetable">
      {props.control && (
        <>
          {props.day > 0 && (
            <a
              className="timetable-day-control timetable-day-control-previous"
              href={controlDay(-1)}
              title={t("kiosk.timetable.previousDay", "Previous day")}
            >
              <i className="fa-solid fa-angle-left fa-fw" />
            </a>
          )}
          {(props.dayLimit === undefined || props.dayLimit - 1 > props.day) && (
            <a
              className="timetable-day-control timetable-day-control-next"
              href={controlDay(1)}
              title={t("kiosk.timetable.nextDay", "Next day")}
            >
              <i className="fa-solid fa-angle-right fa-fw" />
            </a>
          )}
        </>
      )}
      <div className="timetable-header">
        <div className="timetable-days">
          {props.days.map((day) => (
            <div key={day.moment.toISOString()} className="timetable-day" style={position(day)}>
              {showDay(day.moment)}
            </div>
          ))}
        </div>
        <div className="timetable-hours">
          {props.hours.map((hour) => (
            <div key={hour.moment.toISOString()} className="timetable-hour" style={position(hour)}>
              {showHour(hour.moment)}
            </div>
          ))}
        </div>
      </div>
      <div className="timetable-header" style={{ zIndex: "1" }}>
        {Boolean(props.future_length) && (
          <div className="vertical-wrapper">
            <div
              className="vertical"
              style={position({ relStart: props.now, relEnd: props.now + 1 })}
            ></div>
          </div>
        )}
      </div>
      {props.grouped.map((groups, index) => (
        <React.Fragment key={index}>
          {groups.perRoom.map((event, index2) => {
            return (
              <div
                key={index2}
                className={cx(
                  "timetable-row",
                  isRoomRow(event.room, index2) && "timetable-row-room",
                )}
              >
                <div className="timetable-location text-start">
                  <span className="text-nowrap">
                    <i className="fa-solid fa-house fa-fw" />
                    &nbsp;
                    {event.venue.name}
                  </span>{" "}
                  {!!event.room && (
                    <span className="text-nowrap">
                      <i className="fa-solid fa-signs-post fa-fw" />
                      &nbsp;{event.room}
                    </span>
                  )}
                </div>
                {event.rows.map((row, index3) => (
                  <div key={index3} className="timetable-row-section">
                    {row.map((entry) => (
                      <Event key={entry._id} entry={entry}></Event>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </React.Fragment>
      ))}
      {!props.future_length && <h3>{t("kiosk.noFutureEvents", "There are no future events")}</h3>}
    </div>
  );
}

// for Blaze
import "./template.html";
Template.registerHelper("KioskTimetablePage", () => KioskTimetablePage);
