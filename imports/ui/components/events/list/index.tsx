import React from "react";

import { EventModel } from "/imports/api/events/events";

import { EventCompact } from "/imports/ui/components/events/compact";

import "./styles.scss";

export interface Props {
  dataEvents: EventModel[];
  withDate?: boolean | undefined;
  withImage?: boolean | undefined;
  withVenue?: boolean | undefined;
  openInNewTab?: boolean | undefined;
}

export function EventList({ dataEvents, withDate, withImage, withVenue, openInNewTab }: Props) {
  return (
    <div className="container-fluid">
      <div className="row">
        {dataEvents.map((event) => (
          <div key={event._id} className="event-compact-wrap">
            <EventCompact
              event={event}
              withDate={withDate}
              withImage={withImage}
              withVenue={withVenue}
              openInNewTab={openInNewTab}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
