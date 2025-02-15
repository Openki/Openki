import React from "react";

import { EventModel } from "/imports/api/events/events";

import { Event } from "./event";

export function List({
  events,
  timePeriod,
}: {
  events: EventModel[];
  timePeriod: "ongoing" | "today" | "upcoming";
}) {
  return (
    <div className="kiosk-event-list row g-3">
      {events.map((event) => (
        <Event key={event._id} event={event} timePeriod={timePeriod} />
      ))}
    </div>
  );
}
