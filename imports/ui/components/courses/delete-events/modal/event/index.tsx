import React from "react";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { EventModel } from "/imports/api/events/events";

import "./styles.scss";

export interface Props {
  event: EventModel;
}

export function Event({ event }: Props) {
  const { dateFormat, dayOfWeek, timeFormat } = useDateTimeFormat();

  return (
    <>
      <span className="delete-events-events-title">{event.title}</span>{" "}
      <span className="delete-events-details">
        <span className="d-inline-block">
          <i className="fa-regular fa-calendar-days fa-fw" /> {dayOfWeek(event.start)}
          {dateFormat(event.start)}
        </span>{" "}
        <span className="d-inline-block">
          <i className="fa-regular fa-clock fa-fw" /> {timeFormat(event.start)} -{" "}
          {timeFormat(event.end)}
        </span>
      </span>
    </>
  );
}
