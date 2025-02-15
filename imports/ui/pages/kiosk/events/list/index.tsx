import React from "react";

import { EventModel } from "/imports/api/events/events";

import { Event } from "../event";

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
        <Event event={event} timePeriod={timePeriod} />
      ))}
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("KioskEventList", () => List);
