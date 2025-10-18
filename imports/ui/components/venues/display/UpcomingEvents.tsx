import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EventList } from "../../events/list";
import * as Events from "/imports/api/events/publications";
import { useReactiveNow } from "/imports/utils/reactive-now";

const UpcomingEventLimitDefault = 12;
const EventLoadingBlockSize = 9;

export function UpcomingEvents({ venue }: { venue: string }) {
  const { t } = useTranslation();
  const now = useReactiveNow();

  const [upcomingEventLimit, setUpcomingEventLimit] = useState(UpcomingEventLimitDefault);

  const [upcomingEventsIsLoading, upcomingEvents] = Events.useFindFilter(
    { venue, after: now },
    // Add one to the limit so we know there is more to show
    upcomingEventLimit + 1,
  );
  function getUpcomingEvents() {
    const events = upcomingEvents;

    if (events.length > upcomingEventLimit) {
      // The last event is to check if there are any more.
      return events.slice(0, -1);
    }
    return events;
  }
  function hasMoreUpcomingEvents() {
    const count = upcomingEvents.length;
    return count > upcomingEventLimit;
  }

  if (upcomingEventsIsLoading()) {
    return null;
  }

  return (
    <>
      {getUpcomingEvents().length > 0 && (
        <div className="page-component">
          <h2>{t("venue.details.upcomingEvents", "Upcoming events at this venue:")}</h2>
          <EventList dataEvents={getUpcomingEvents()} withDate={true} withVenue={false} />
          {hasMoreUpcomingEvents() && (
            <>
              <div className="clearfix"></div>
              <button
                type="button"
                className="btn btn-add"
                onClick={() => {
                  setUpcomingEventLimit(upcomingEventLimit + EventLoadingBlockSize);
                }}
              >
                {t("_button.more")}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
