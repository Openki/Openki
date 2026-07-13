import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { useDetails } from "/imports/api/groups/publications";
import { EventModel } from "/imports/api/events/events";

import { CustomFieldDisplay } from "../../../groups/CustomFieldDisplay";
import { InternalIndicator } from "../../../internal-indicator";
import { Display } from "../../../location/display";
import { PricePolicy } from "../../../price-policy";
import { Sharing } from "../../../sharing";
import { VenueLink } from "../../../venues/link";
import { OrganizationList } from "../organization-list";
import { EventHeader } from "../header";

import "./styles.scss";

export function Content({ event }: { event: EventModel }) {
  const { t } = useTranslation();

  const [isLoading, group] = useDetails({ when: !!event.groupId }, event.groupId);

  return (
    <>
      {event.groupId ? (
        <EventHeader start={event.startLocal} end={event.endLocal} />
      ) : (
        <EventHeader regionId={event.region} start={event.startLocal} end={event.endLocal} />
      )}

      <div className="details-body event-details-body">
        <div className="details-content">
          {event.internal && <InternalIndicator />}

          <div className="row">
            <div className="col-md-7">
              {!isLoading() && !group?.singleEvent && (
                <>
                  <h3>{event.title}</h3>
                  <OrganizationList event={event} />
                </>
              )}

              <p
                className="event-details-description"
                dangerouslySetInnerHTML={{ __html: event.description }}
              ></p>

              {!!event.groupId && <CustomFieldDisplay groupId={event.groupId} />}
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
            <PricePolicy dismissible wrap="event-details-price-policy" />
            <div className="p-3 text-end" id="share">
              <h4>
                {t("sharing.title", "Invite your friends")}{" "}
                <Sharing url={Router.url("showEvent", event)} />
              </h4>
            </div>
          </>
        )}
      </div>
    </>
  );
}
