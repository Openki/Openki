import React from "react";
import { useTranslation } from "react-i18next";

import { useDetails } from "/imports/api/courses/publications";
import { EventModel } from "/imports/api/events/events";

import { CustomFieldDisplay } from "../../../courses/CustomFieldDisplay";
import { InternalIndicator } from "../../../internal-indicator";
import { Display } from "../../../location/display";
import { PricePolicy } from "../../../price-policy";
import { Sharing } from "../../../sharing";
import { VenueLink } from "../../../venues/link";
import { GroupList } from "../organization-list";
import { EventHeader } from "../header";

import "./styles.scss";

export function Content({ event }: { event: EventModel }) {
  const { t } = useTranslation();

  const [isLoading, course] = useDetails({ when: !!event.courseId }, event.courseId);

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
              {!isLoading() && !course?.singleEvent && (
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
                  <Display
                    region={event.region}
                    level={event.venue.level}
                    coordinates={event.venue.loc.coordinates}
                  />
                )}

                <div className="tag-group multiline mt-1">
                  {!!event.venue && <VenueLink venue={event.venue} room={event.room} />}
                </div>
                {!!event.venue?.address && (
                  <div className="tag">
                    <i className="fa-solid fa-location-dot fa-fw" />
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
            <div className="p-3 text-end" id="share">
              <h4>
                {t("sharing.title", "Invite your friends")} <Sharing />
              </h4>
            </div>
          </>
        )}
      </div>
    </>
  );
}
