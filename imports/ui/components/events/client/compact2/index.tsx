import React, { useRef, useState } from "react";

import { EventModel } from "/imports/api/events/events";

import "./styles.scss";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { EventRegistration } from "../../display/registration";

export interface Props {
  event: EventModel;
}

export function EventCompact2({ event }: Props) {
  const { timeFormat } = useDateTimeFormat();

  const [a, setA] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={elementRef} className={"me-2 panel " + (!a ? "panel-small" : "panel-extended")}>
      <div className="card">
        <div
          className="card-header card-header-img"
          style={{ backgroundImage: `url('${event?.publicUrlForCompactImage()}')` }}
        ></div>
        <div className="card-body">
          <h5 className="card-title text-truncate">
            {
              <a
                className="stretched-link"
                data-bs-toggle="collapse"
                href={"#collapseExample" + event._id}
                role="button"
                aria-expanded="false"
                aria-controls={"collapseExample" + event._id}
                onClick={() => {
                  const element = elementRef.current;
                  if (element) {
                    if (!a) {
                      element.style.left = element?.offsetLeft + "px";
                      element.style.top = element?.offsetTop + "px";
                      element.style.position = "fixed";
                    } else {
                      setTimeout(() => {
                        element.style.position = "static";
                      }, 350);
                    }
                  }

                  setA(!a);
                }}
              >
                {event.title}
              </a>
            }
          </h5>
          <p className="card-text text-truncate">
            {timeFormat(event.startLocal)} - {timeFormat(event.endLocal)}
            <br />
            {!!event.venue?.name && <>{event.venue.name}</>}
          </p>
          <div className="collapse" id={"collapseExample" + event._id}>
            <p className="card-text" dangerouslySetInnerHTML={{ __html: event.description }}></p>
            <EventRegistration event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}
