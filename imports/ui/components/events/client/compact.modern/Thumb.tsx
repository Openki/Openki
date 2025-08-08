import React from "react";
import { StatePanel } from "./StatePanel";
import { EventModel } from "/imports/api/events/events";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

export function Thumb({ event }: { event: EventModel }) {
  const { timeFormat } = useDateTimeFormat();
  const locationPreview = [event.venue?.name, event.venue?.address].filter((v) => v)[0];

  return (
    <div className="card me-1" style={{ width: 320, minWidth: 320 }}>
      <div
        className="position-relative card-header card-header-img"
        style={
          event?.publicUrlForCompactImage()
            ? { backgroundImage: `url('${event?.publicUrlForCompactImage()}')` }
            : {}
        }
      >
        <StatePanel event={event} />
      </div>
      <div className="card-body">
        <h4 className="card-title text-truncate">{event.title}</h4>
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
