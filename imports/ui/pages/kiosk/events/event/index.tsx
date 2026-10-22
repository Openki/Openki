import React from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/ui/hooks/useDateTimeFormat";
import { textPlain } from "/imports/utils/html-tools";

import { EventModel } from "/imports/api/events/events";

import { Location } from "../Location";

import "./styles.scss";

export function Event({
  event,
  timePeriod,
}: {
  event: EventModel;
  timePeriod: "ongoing" | "today" | "upcoming";
}) {
  const { t } = useTranslation();
  const { dateFormat, fromNow, timeFormat } = useDateTimeFormat();

  return (
    <div className={`kiosk-event-wrap kiosk-event-wrap-${timePeriod} col-6 col-lg-3 col-xl-2`}>
      {event.canceled ? (
        <span className="kiosk-event-canceled">{t("_event.state.canceled")}</span>
      ) : (
        event.isFullyBooked() && (
          <span className="kiosk-event-fully-booked">{t("_event.state.fullyBooked")}</span>
        )
      )}

      <a href={Router.path("showEvent", event)}>
        <div className={`kiosk-event kiosk-event-${timePeriod}`}>
          {timePeriod !== "upcoming" && (
            <div className="kiosk-event-timecount">
              <i className="fa-solid fa-circle-play fa-fw" />{" "}
              {timePeriod === "ongoing" && t("kiosk.started", "Started")} {fromNow(event.start)}
            </div>
          )}

          <div className="kiosk-event-header clearfix">
            {timePeriod !== "ongoing" && <Location event={event} />}
            <div className="kiosk-event-moment">
              {timePeriod === "upcoming" && (
                <>
                  <i className="fa-regular fa-calendar-days fa-fw" /> {dateFormat(event.start)}
                  <br />
                </>
              )}
              <i className="fa-regular fa-clock fa-fw" /> {timeFormat(event.start)}
              {timePeriod !== "upcoming" && <> - {timeFormat(event.end)}</>}
            </div>
            {timePeriod === "ongoing" && <Location event={event} />}
          </div>
          <div className="kiosk-event-body">
            <h3 className="kiosk-event-title">{textPlain(event.title)}</h3>
            {timePeriod !== "ongoing" && (
              <>
                <br />
                <p className="d-inline">{textPlain(event.description)}</p>
              </>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}
