import { Router } from "meteor/iron:router";
import moment from "moment";
import React from "react";
import { useTranslation } from "react-i18next";
import { useUserId } from "/imports/utils/react-meteor-data";

import { EventModel } from "/imports/api/events/events";

import { InternalIndicator } from "/imports/ui/components/internal-indicator";
import { RoomTag, VenueLink } from "/imports/ui/components/venues/link";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import "./styles.scss";

function eventCompactClasses(event: EventModel, withDate?: boolean) {
  const classes = [];
  if (withDate) {
    classes.push("has-date");
  }
  if (moment().isAfter(event.end) || event.isFullyBooked() || event.canceled) {
    classes.push("is-past");
  }

  return classes.join(" ");
}

function bodyStyle(event: EventModel, withImage?: boolean | undefined) {
  if (!withImage) {
    return {};
  }

  const src = event?.publicUrlForCompactImage();
  if (!src) {
    return {};
  }

  return {
    backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}')`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
}

export interface Props {
  event: EventModel;
  withDate?: boolean | undefined;
  withImage?: boolean | undefined;
  withVenue?: boolean | undefined;
  openInNewTab?: boolean | undefined;
}

export function EventCompact({
  event,
  withDate,
  withImage,
  withVenue = true,
  openInNewTab,
}: Props) {
  const { t } = useTranslation();
  const { dayOfWeek, calendarDayShort, timeFormat } = useDateTimeFormat();
  const userId = useUserId();

  return (
    <div className={`event-compact ${eventCompactClasses(event, withDate)}`}>
      {event.canceled ? (
        <span className="event-canceled">{t("_event.state.canceled")}</span>
      ) : (
        event.isFullyBooked() && (
          <span className="event-fully-booked">{t("_event.state.fullyBooked")}</span>
        )
      )}
      <div
        className={`event-compact-header${event.attendedBy(userId) ? " user-attends-event" : ""}`}
      >
        {!!withDate && (
          <>
            <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>{" "}
            {dayOfWeek(event.startLocal)} {calendarDayShort(event.startLocal)}
            <br />
          </>
        )}
        <span className="fa-regular fa-clock fa-fw" aria-hidden="true"></span>{" "}
        <span className="event-compact-time">
          {timeFormat(event.startLocal)} - {timeFormat(event.endLocal)}
        </span>
        {withVenue
          ? !!event.venue && (
              <>
                <br />
                <div className="tag-group">
                  <VenueLink venue={event.venue} room={event.room} openInNewTab={openInNewTab} />
                </div>
              </>
            )
          : !!event.room && (
              <>
                <br />
                <RoomTag name={event.room} />
              </>
            )}
      </div>
      <div className="event-compact-body-wrap" style={bodyStyle(event, withImage)}>
        <div className="event-compact-body">
          {event.internal && <InternalIndicator />}
          <h4 className="event-compact-title">
            <a
              className="stretched-link"
              href={Router.path("showEvent", event)}
              target={openInNewTab ? "_blank" : ""}
              rel="noreferrer"
            >
              {event.title}
            </a>
          </h4>
          <br />
          <p
            className={`event-compact-description`}
            dangerouslySetInnerHTML={{ __html: event.description }}
          ></p>
        </div>
      </div>
    </div>
  );
}
