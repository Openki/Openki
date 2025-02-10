import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EventList } from "../../components/events/list";
import * as Events from "/imports/api/events/publications";
import { useReactiveNow } from "/imports/utils/reactive-now";

const PastEventLimitDefault = 3;
const EventLoadingBlockSize = 9;

export function PastEvents({ venue }: { venue: string }) {
  const { t } = useTranslation();
  const now = useReactiveNow();

  const [pastEventLimit, setPastEventLimit] = useState(PastEventLimitDefault);

  const [pastEventsIsLoading, pastEvents] = Events.useFindFilter(
    { venue, before: now },
    // Add one to the limit so we know there is more to show
    pastEventLimit + 1,
  );
  function getPastEvents() {
    const events = pastEvents;

    if (events.length > pastEventLimit) {
      // The last event is to check if there are any more.
      return events.slice(0, -1);
    }
    return events;
  }
  function hasMorePastEvents() {
    const count = pastEvents.length;
    return count > pastEventLimit;
  }

  if (pastEventsIsLoading()) {
    return null;
  }

  return (
    <>
      {getPastEvents().length > 0 && (
        <div className="page-component">
          <h2>{t("venue.details.pastEvents", "Past events:")}</h2>
          <EventList dataEvents={getPastEvents()} withDate={true} withVenue={false} />
          {hasMorePastEvents() && (
            <>
              <div className="clearfix"></div>
              <button
                type="button"
                className="btn btn-add"
                onClick={() => {
                  setPastEventLimit(pastEventLimit + EventLoadingBlockSize);
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
