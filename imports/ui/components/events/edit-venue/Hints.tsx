import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useDetails as useVenueDetails } from "/imports/api/venues/publications";
import { filterUserVenues } from "/imports/ui/components/events/edit-venue/search";
import { OtherEventsMessage } from "/imports/ui/components/events/edit/OtherEventsMessage";
import { useFindParallelEvents } from "/imports/ui/components/events/edit/useFindParallelEvents";
import { useUser } from "/imports/utils/react-meteor-data";

export function Hints({
  venueId,
  regionId,
  event,
}: {
  venueId: string | undefined;
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

  const [venueIsLoading, venue] = useVenueDetails(venueId || "-1");
  const parallelEvents = useFindParallelEvents(venueId, regionId, event);

  const inSameRoom = parallelEvents.find(
    (e) => e.room && event.room && e.room.toUpperCase() === event.room.toUpperCase(),
  );
  return (
    <>
      {!venueIsLoading() && !!venue && (
        <>
          {venue.allowParallelEvents && parallelEvents.length > 0 && (
            <div
              data-test="events-edit-venue-hint-parallel-events"
              className="alert alert-warning p-2"
            >
              <span className="fa-solid fa-triangle-exclamation fa-fw" aria-hidden="true"></span>{" "}
              {t("event.edit.venue.parallelEvents.allowed", "Event is overlapping.")}{" "}
              {inSameRoom && (
                <>
                  {t(
                    "event.edit.venue.parallelEvents.sameRoom",
                    "Your event seem to be in same room as an other event.",
                  )}{" "}
                </>
              )}
              <OtherEventsMessage events={parallelEvents} />
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
                  <span
                    className="fa-solid fa-triangle-exclamation fa-fw"
                    aria-hidden="true"
                  ></span>{" "}
                  {t(
                    "event.editVenue.restrictedUse",
                    "This venue can only be chosen by its hosts to publish an event.",
                  )}
                </div>
              ) : (
                <div
                  data-test="events-edit-venue-hint-contact-host"
                  className="alert alert-success p-2"
                >
                  {t(
                    "event.editVenue.pleaseContactHost",
                    "Make sure you have contacted the host of this venue for availability.",
                  )}
                </div>
              ))
          }
        </>
      )}
    </>
  );
}
