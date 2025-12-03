import React, { useState } from "react";
import { EventModel } from "/imports/api/events/events";
import { Regions } from "/imports/api/regions/regions";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useSessionEquals } from "/imports/utils/react-meteor-data";
import { useSiteName } from "/imports/utils/getSiteName";
import { Router } from "meteor/iron:router";

export function Event({ data }: { data: EventModel }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { timeFormat, fromNow } = useDateTimeFormat();
  const allRegions = useSessionEquals("region", "all");
  const siteName = useSiteName();

  function regionName() {
    return Regions.findOne(data.region)?.name;
  }
  function getAttendees() {
    return data.numberOfParticipants();
  }
  function getTotalAvailableSeats() {
    return data.maxParticipants || <>&#8734;</>;
  }
  function isUnlimited() {
    return !data.maxParticipants;
  }

  return (
    <div className={`frame-list-item-event ${data.canceled ? "frame-list-item-canceled" : ""}`}>
      <div className="position-relative">
        {new Date() > data.start && (
          <div className="text-primary">
            <i className="fa-solid fa-circle-play fa-fw" />{" "}
            {t("frame.eventsList.started", "Started {FROMNOW}", { FROMNOW: fromNow(data.start) })}
          </div>
        )}
        <h4
          className={`frame-list-item-header ${isExpanded ? "active" : ""} stretched-link`}
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          <span className="frame-list-item-toggle-indicator">
            <i className="fa-solid fa-angle-down" />
          </span>
          {!data.noRsvp && (
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
            {timeFormat(data.start)}
          </span>
          <strong>{data.title}</strong>
          {allRegions && (
            <span className="badge bg-primary frame-list-item-region">{regionName()}</span>
          )}
        </h4>
      </div>
      {isExpanded && (
        <div className="p-2">
          <div className="row">
            <div className="col-4 col-sm-2">
              <strong>{t("frame.eventsList.when", "When:")}</strong>
            </div>
            <div className="col-8 col-sm-10">
              {timeFormat(data.start)} - {timeFormat(data.end)}
            </div>
          </div>
          <div className="row">
            <div className="col-4 col-sm-2">
              <strong>{t("frame.eventsList.where", "Where:")}</strong>
            </div>
            <div className="col-8 col-sm-10">
              {data.venue?._id ? (
                <a href={Router.path("venueDetails", data.venue)} target="_blank" rel="noreferrer">
                  {data.venue.name}
                </a>
              ) : (
                data.venue?.name
              )}
              {!!data.room && <> - {data.room}</>}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-2">
              <strong>{t("frame.eventsList.description", "Description:")}</strong>
            </div>
            <div className="col-sm-10" dangerouslySetInnerHTML={{ __html: data.description }}></div>
          </div>
          <div className="mt-2 d-grid d-sm-flex">
            <a
              className="btn btn-outline-dark"
              href={Router.path("showEvent", data)}
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
