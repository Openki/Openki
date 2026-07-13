import React, { useState } from "react";
import { EventModel } from "/imports/api/events/events";
import { Regions } from "/imports/api/regions/regions";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useSessionEquals } from "/imports/utils/react-meteor-data";
import { useSiteName } from "/imports/utils/getSiteName";
import { Router } from "meteor/iron:router";

export interface Props {
  event: EventModel;
  hideRsvp: boolean;
}

export function Event({ event, hideRsvp }: Props) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { timeFormat, fromNow } = useDateTimeFormat();
  const allRegions = useSessionEquals("region", "all");
  const siteName = useSiteName();

  function regionName() {
    return Regions.findOne(event.region)?.name;
  }
  function getAttendees() {
    return event.numberOfParticipants();
  }
  function getTotalAvailableSeats() {
    return event.maxParticipants || <>&#8734;</>;
  }
  function isUnlimited() {
    return !event.maxParticipants;
  }

  return (
    <div className={`frame-list-item-event ${event.canceled ? "frame-list-item-canceled" : ""}`}>
      <div className="position-relative">
        {new Date() > event.start && (
          <div className="text-primary">
            <i className="fa-solid fa-circle-play fa-fw" />{" "}
            {t("frame.eventsList.started", "Started {FROMNOW}", { FROMNOW: fromNow(event.start) })}
          </div>
        )}
        <h4
          className={`frame-list-item-header ${isExpanded ? "active" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="frame-list-item-toggle-indicator">
            <i className="fa-solid fa-angle-down" />
          </span>
          {!hideRsvp && !event.noRsvp && (
            <div
              className="frame-list-free-seats"
              data-bs-title={
                isUnlimited()
                  ? t(
                      "frame.list.reservation.status.unlimited.tooltip",
                      "{RESERVEDSEATS} of unlimited seats reserved",
                      { RESERVEDSEATS: getAttendees() },
                    )
                  : t(
                      "frame.list.reservation.status.tooltip",
                      "{RESERVEDSEATS} of {TOTALSEATS} seats reserved",
                      { RESERVEDSEATS: getAttendees(), TOTALSEATS: getTotalAvailableSeats() },
                    )
              }
            >
              <span className="me-1">
                {getAttendees()}/{getTotalAvailableSeats()}
              </span>
              <i className="fa-solid fa-user fa-fw" />
            </div>
          )}

          <span className={`frame-list-item-time ${isExpanded ? "hidden" : ""}`}>
            {timeFormat(event.start)}
          </span>
          <span className="fw-bold">{event.title}</span>
          {allRegions && (
            <span className="badge bg-primary frame-list-item-region">{regionName()}</span>
          )}
        </h4>
      </div>
      {isExpanded && (
        <div className="p-2">
          <div className="row">
            <div className="col-4 col-sm-2 fw-bold">{t("frame.eventsList.when", "When:")}</div>
            <div className="col-8 col-sm-10">
              {timeFormat(event.start)} - {timeFormat(event.end)}
            </div>
          </div>
          <div className="row">
            <div className="col-4 col-sm-2 fw-bold">{t("frame.eventsList.where", "Where:")}</div>
            <div className="col-8 col-sm-10">
              {event.venue?._id ? (
                <a href={Router.path("venueDetails", event.venue)} target="_blank" rel="noreferrer">
                  {event.venue.name}
                </a>
              ) : (
                event.venue?.name
              )}
              {!!event.room && <> - {event.room}</>}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-2 fw-bold">
              {t("frame.eventsList.description", "Description:")}
            </div>
            <div
              className="col-sm-10"
              dangerouslySetInnerHTML={{ __html: event.description }}
            ></div>
          </div>
          <div className="mt-2 d-grid d-sm-flex">
            <a
              className="btn btn-outline-dark"
              href={Router.path("showEvent", event)}
              target="_blank"
              rel="noreferrer"
            >
              {t("frame.calendar.moreAboutThisEvent", "More about this event on {SITENAME}", {
                SITENAME: siteName,
              })}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// for Blaze
import "./template.html";
Template.registerHelper("FrameCalendarEvent", () => Event);
