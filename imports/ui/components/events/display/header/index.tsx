import { MomentInput } from "moment";
import React from "react";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { RegionTag } from "/imports/ui/components/regions/tag";

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
      {props.regionId ? <RegionTag region={props.regionId} /> : undefined}

      <p className="h3">
        <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>{" "}
        {dayOfWeek(props.start)} {calendarDayShort(props.start)}
        <br />
        <small>
          <span className="fa-regular fa-clock fa-fw" aria-hidden="true"></span>{" "}
          {timeFormat(props.start)} - {timeFormat(props.end)}
        </small>
      </p>
    </div>
  );
}
