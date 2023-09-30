import { Template } from "meteor/templating";
import React from "react";

import { EventModel } from "/imports/api/events/events";

import { EventCompact } from "/imports/ui/components/events/compact";

export function EventList(props: {
  dataEvents: EventModel[];
  withDate?: boolean | undefined;
  withImage?: boolean | undefined;
  openInNewTab?: boolean | undefined;
}) {
  const { dataEvents, withDate, withImage, openInNewTab } = props;

  return (
    <div className="container-fluid">
      <div className="row">
        {dataEvents.map((event) => (
          <EventCompact
            key={event._id}
            event={event}
            withDate={withDate}
            withImage={withImage}
            openInNewTab={openInNewTab}
          />
        ))}
      </div>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("EventList", () => EventList);
