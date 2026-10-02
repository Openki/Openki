import React from "react";
import { useDateTimeFormat } from "/imports/ui/hooks/useDateTimeFormat";

import { EventModel } from "/imports/api/events/events";

export interface Props {
  event: EventModel;
}

export function Event({ event }: Props) {
  const { dateFormat, dayOfWeek, timeFormat } = useDateTimeFormat();

  return (
    <>
      <div>{event.title}</div>
      <div className="text-secondary-emphasis">
        <div>
          <i className="fa-regular fa-calendar-days fa-fw" /> {dayOfWeek(event.start)}
          {dateFormat(event.start)}
        </div>
        <div>
          <i className="fa-regular fa-clock fa-fw" /> {timeFormat(event.start)} -{" "}
          {timeFormat(event.end)}
        </div>
      </div>
    </>
  );
}
