import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { useDetails as useVenueDetails } from "/imports/api/venues/publications";
import { EventVenueEntity } from "/imports/api/events/events";

import { OtherEventsMessage } from "/imports/ui/components/events/edit/OtherEventsMessage";
import { useFindParallelEvents } from "/imports/ui/components/events/edit/useFindParallelEvents";
import { filterUserVenues } from "/imports/ui/components/events/edit-venue/search/SearchBase";
import { useFindExternalParallelEvents } from "/imports/ui/components/events/edit/useFindExternalParallelEvents";
import { Router } from "meteor/iron:router";

function ContactHostHint() {
  const { t } = useTranslation();

  return (
    <div data-test="events-edit-venue-hint-contact-host" className="alert alert-success p-2">
      {t(
        "event.editVenue.pleaseContactHost",
        "Make sure you have contacted the host of this venue for availability.",
      )}
    </div>
  );
}

export function Hints({
  venue: eventVenue,
  regionId,
  event,
}: {
  venue: EventVenueEntity | undefined;
  regionId: string;
  event: {
    _id?: string | undefined;
    room?: string | undefined;
    startLocal: string;
    endLocal: string;
  };
}) {
  const { t } = useTranslation();
  const user = useUser();

  const [venueIsLoading, venue] = useVenueDetails(eventVenue?._id || "-1");
  const parallelEvents = useFindParallelEvents(regionId, eventVenue?._id, event);
  const externalParallelEvents = useFindExternalParallelEvents(regionId, eventVenue?._id, event);

  const allParallelEvents = [
    ...parallelEvents.map((e) => ({ ...e, url: Router.path("showEvent", e) })),
    ...externalParallelEvents.map((e) => ({
      _id: e.id,
      title: e.summary,
      room: e.location,
      startLocal: e.start,
      endLocal: e.end,
      url: e.url,
    })),
  ];

  const inSameRoom = allParallelEvents.find(
    (e) => e.room && event.room && e.room.toUpperCase() === event.room.toUpperCase(),
  );

  if (eventVenue && !eventVenue._id) {
    return <ContactHostHint />;
  }

  if (venueIsLoading()) {
    return null;
  }

  if (venue) {
    return (
      <>
        {venue.allowParallelEvents && allParallelEvents.length > 1 && (
          <div
            data-test="events-edit-venue-hint-parallel-events"
            className="alert alert-warning p-2"
          >
            <i className="fa-solid fa-triangle-exclamation fa-fw" />{" "}
            {t("event.edit.venue.parallelEvents.allowed", "Event is overlapping.")}{" "}
            {inSameRoom && (
              <>
                {t(
                  "event.edit.venue.parallelEvents.sameRoom",
                  "Your event seem to be in same room as an other event.",
                )}{" "}
              </>
            )}
            <OtherEventsMessage events={allParallelEvents} />
          </div>
        )}

        {
          /* Not show hint if user is editor of venue */
          filterUserVenues(user, [venue]).length === 0 &&
            (venue.restrictedUse ? (
              <div
                data-test="events-edit-venue-hint-restricted-use"
                className="alert alert-warning p-2"
              >
                <i className="fa-solid fa-triangle-exclamation fa-fw" />{" "}
                {t(
                  "event.editVenue.restrictedUse",
                  "This venue can only be chosen by its hosts to publish an event.",
                )}
              </div>
            ) : (
              <ContactHostHint />
            ))
        }
      </>
    );
  }

  return null;
}
