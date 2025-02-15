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
          <span className="fa-solid fa-house fa-fw" aria-hidden="true"></span> {event.venue?.name}
          {!!event.room && <> - </>}
        </>
      )}
      {!!event.room && (
        <>
          {!showLocation() && (
            <>
              <span className="fa-solid fa-signs-post fa-fw" aria-hidden="true"></span>{" "}
            </>
          )}
          {event.room}
        </>
      )}
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("KioskEventLocation", () => Location);
