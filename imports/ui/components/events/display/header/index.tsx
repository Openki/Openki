import { MomentInput } from "moment";
import React from "react";

import { useDateTimeFormat } from "/imports/ui/hooks/useDateTimeFormat";

import { Tag } from "/imports/ui/components/regions/tag";

import "./styles.scss";

export interface Props {
  regionId?: string;
  start: MomentInput;
  end: MomentInput;
}

export function EventHeader(props: Props) {
  const { dayOfWeek, calendarDayShort, timeFormat } = useDateTimeFormat();
  return (
    <div className="details-header event-details-header">
      {!!props.regionId && <Tag region={props.regionId} />}

      <p className="h3">
        <i className="fa-regular fa-calendar-days fa-fw" /> {dayOfWeek(props.start)}{" "}
        {calendarDayShort(props.start)}
        <br />
        <small>
          <i className="fa-regular fa-clock fa-fw" /> {timeFormat(props.start)} -{" "}
          {timeFormat(props.end)}
        </small>
      </p>
    </div>
  );
}
