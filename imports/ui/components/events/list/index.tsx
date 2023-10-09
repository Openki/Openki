import { Template } from "meteor/templating";
import React from "react";

import { EventModel } from "/imports/api/events/events";

import { EventCompact } from "/imports/ui/components/events/compact";

import "./styles.scss";

export type Props = {
  dataEvents: EventModel[];
  withDate?: boolean | undefined;
  withImage?: boolean | undefined;
  openInNewTab?: boolean | undefined;
};

export function EventList({ dataEvents, withDate, withImage, openInNewTab }: Props) {
  return (
    <div className="container-fluid">
      <div className="row">
        {dataEvents.map((event) => (
          <div key={event._id} className="event-compact-wrap">
            <EventCompact
              event={event}
              withDate={withDate}
              withImage={withImage}
              openInNewTab={openInNewTab}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("EventList", () => EventList);
