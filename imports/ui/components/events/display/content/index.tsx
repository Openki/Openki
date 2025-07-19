import React from "react";
import { Meteor } from "meteor/meteor";
import { useTranslation } from "react-i18next";

import { Courses } from "/imports/api/courses/courses";
import { EventModel } from "/imports/api/events/events";

import { getLocalizedValue } from "/imports/utils/getLocalizedValue";

import { EventHeader } from "../header";
import { InternalIndicator } from "../../../internal-indicator";
import { GroupList } from "../group-list";
import { Display } from "../../../location/display";
import { VenueLink } from "../../../venues/link";
import { PricePolicy } from "../../../price-policy";
import { Sharing } from "../../../sharing";

import "./styles.scss";

export function Content({ event }: { event: EventModel }) {
  const { t } = useTranslation();

  function singleEvent() {
    return Courses.findOne(event.courseId)?.singleEvent;
  }
  function customFields() {
    if (!event.courseId) {
      return [];
    }
    const course = Courses.findOne(event.courseId);

    if (!course) {
      return [];
    }

    const user = Meteor.user();

    const isEditor = user && course.editableBy(user);

    return (
      course.customFields
        ?.filter((i) => i.visibleFor === "all" || (i.visibleFor === "editors" && isEditor))
        .map((i) => ({
          displayText: getLocalizedValue(i.displayText),
          isboolean: typeof i.value === "boolean",
          value: i.value,
        })) || []
    );
  }

  return (
    <>
      {event.courseId ? (
        <EventHeader start={event.startLocal} end={event.endLocal} />
      ) : (
        <EventHeader regionId={event.region} start={event.startLocal} end={event.endLocal} />
      )}

      <div className="details-body event-details-body">
        <div className="details-content">
          {event.internal && <InternalIndicator />}

          <div className="row">
            <div className="col-md-7">
              {!singleEvent() && (
                <>
                  <h3>{event.title}</h3>
                  <GroupList event={event} />
                </>
              )}

              <p
                className="event-details-description"
                dangerouslySetInnerHTML={{ __html: event.description }}
              ></p>

              {customFields().map((info, index) => (
                <p key={index}>
                  <strong>{info.displayText}</strong>:
                  {!info.isboolean ? (
                    <span className="pre-line">{info.value}</span>
                  ) : info.value ? (
                    t("customField.boolean.yes", "Yes")
                  ) : (
                    t("customField.boolean.no", "No")
                  )}
                </p>
              ))}
            </div>
            <div className="col-md-5">
              <div className="details-map">
                {!!event.venue?.loc?.coordinates && (
                  <Display coordinates={event.venue?.loc?.coordinates} />
                )}

                <div className="tag-group multiline mt-1">
                  {!!event.venue && <VenueLink venue={event.venue} room={event.room} />}
                </div>
                {!!event.venue?.address && (
                  <div className="tag">
                    <span className="fa-solid fa-location-dot fa-fw" aria-hidden="true"></span>
                    {event.venue.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {!event.isPrivate() && (
          <>
            <PricePolicy dismissable wrap="event-details-price-policy" />
            <Sharing />
          </>
        )}
      </div>
    </>
  );
}
