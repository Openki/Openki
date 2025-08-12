import React from "react";
import { StatePanel } from "./StatePanel";
import { EventModel } from "/imports/api/events/events";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { ImagePlaceholder } from "./ImagePlaceholder";

export function Thumb({ event }: { event: EventModel }) {
  const { timeFormat } = useDateTimeFormat();
  const locationPreview = [event.venue?.name, event.venue?.address].filter((v) => v)[0];

  return (
    <div className="card me-1" style={{ width: 320, minWidth: 320 }}>
      {event?.publicUrlForCompactImage() ? (
        <div
          className="position-relative card-header card-header-img border-bottom"
          style={{ backgroundImage: `url('${event.publicUrlForCompactImage()}')` }}
        >
          <StatePanel event={event} />
        </div>
      ) : (
        <ImagePlaceholder seed={event._id} regionId={event.region}>
          <StatePanel event={event} />
        </ImagePlaceholder>
      )}
      <div className="card-body">
        <h3 className="card-title text-truncate">{event.title}</h3>
        <p className="card-text text-truncate">
          <i className="fa-regular fa-fw fa-clock"></i> {timeFormat(event.startLocal)} -{" "}
          {timeFormat(event.endLocal)}
          <br />
          {!!locationPreview && (
            <>
              <i className="fa-solid fa-fw fa-location-dot"></i>
              {locationPreview}
            </>
          )}
          {/* Force the same height if no value is set for venue */}
          &nbsp;
        </p>
      </div>
    </div>
  );
}
