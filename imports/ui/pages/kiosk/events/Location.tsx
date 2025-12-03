import React from "react";
import { Router } from "meteor/iron:router";
import { EventModel } from "/imports/api/events/events";

export function Location({ event }: { event: EventModel }) {
  function showLocation() {
    // The location is shown when we have a location name and the location is not used as a filter
    return !!(event.venue?.name && !Router.current().params.query.venue);
  }

  return (
    <div className="kiosk-event-location">
      {showLocation() && (
        <>
          <i className="fa-solid fa-house fa-fw" /> {event.venue?.name}
          {!!event.room && <> - </>}
        </>
      )}
      {!!event.room && (
        <>
          {!showLocation() && (
            <>
              <i className="fa-solid fa-signs-post fa-fw" />{" "}
            </>
          )}
          {event.room}
        </>
      )}
    </div>
  );
}
