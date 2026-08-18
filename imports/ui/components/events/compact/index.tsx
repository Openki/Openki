import { Router } from "meteor/iron:router";
import moment from "moment";
import React from "react";
import { useTranslation } from "react-i18next";

import { EventModel } from "/imports/api/events/events";

import { useUserId } from "/imports/utils/react-meteor-data";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { cx } from "/imports/utils/cx";

import { InternalIndicator } from "/imports/ui/components/internal-indicator";
import { RoomTag, VenueLink } from "/imports/ui/components/venues/link";

import "./styles.scss";

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
    <div
      className={cx(
        "event-compact",
        withDate && "has-date",
        (moment().isAfter(event.end) || event.isFullyBooked() || event.canceled) && "is-past",
      )}
    >
      {event.canceled ? (
        <span className="event-canceled">{t("_event.state.canceled")}</span>
      ) : (
        event.isFullyBooked() && (
          <span className="event-fully-booked">{t("_event.state.fullyBooked")}</span>
        )
      )}
      <div
        className={cx(
          "event-compact-header p-2",
          event.attendedBy(userId) && "bg-user",
        )}
      >
        {!!withDate && (
          <>
            <i className="fa-regular fa-calendar-days fa-fw" /> {dayOfWeek(event.startLocal)}{" "}
            {calendarDayShort(event.startLocal)}
            <br />
          </>
        )}
        <i className="fa-regular fa-clock fa-fw" />{" "}
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
      <div className="flex-grow-1" style={bodyStyle(event, withImage)}>
        <div className="event-compact-body m-2 line-clamp-4">
          {event.internal && <InternalIndicator />}
          <h4 className="mb-1 fw-semibold">
            <a
              className="stretched-link text-body"
              href={Router.path("showEvent", event)}
              target={openInNewTab ? "_blank" : ""}
              rel="noreferrer"
            >
              {event.title}
            </a>
          </h4>
          <p className="text-body" dangerouslySetInnerHTML={{ __html: event.description }} />
        </div>
      </div>
    </div>
  );
}
