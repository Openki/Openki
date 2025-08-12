import React from "react";

import { Courses } from "/imports/api/courses/courses";
import { EventModel } from "/imports/api/events/events";

import { EventHeader } from "../header";
import { InternalIndicator } from "../../../internal-indicator";
import { GroupList } from "../group-list";
import { Display } from "../../../location/display";
import { VenueLink } from "../../../venues/link";
import { PricePolicy } from "../../../price-policy";
import { Sharing } from "../../../sharing";
import { CustomFieldDisplay } from "../../../courses/CustomFieldDisplay";

import "./styles.scss";

export function Content({ event }: { event: EventModel }) {
  function singleEvent() {
    return Courses.findOne(event.courseId)?.singleEvent;
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

              {!!event.courseId && <CustomFieldDisplay courseId={event.courseId} />}
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
            <div className="p-3" id="share">
              <Sharing align="end" />
            </div>
          </>
        )}
      </div>
    </>
  );
}
