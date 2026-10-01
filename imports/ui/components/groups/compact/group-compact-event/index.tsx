import React from "react";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { numberOf } from "/imports/api/events/lib/numberOf";

import { GroupModel } from "/imports/api/groups/groups";

import "./styles.scss";

export function GroupCompactEvent({ event }: { event: NonNullable<GroupModel["nextEvent"]> }) {
  const { dateShort, timeFormat, dateToRelativeString } = useDateTimeFormat();

  return (
    <div className="group-compact-next-event col">
      {!!event.venue?.name && (
        <div className="truncate" title={event.venue.name}>
          {event.venue.name}
        </div>
      )}
      <div
        className="truncate"
        title={`${dateShort(event?.startLocal)} ${timeFormat(event?.startLocal)}`}
      >
        {dateToRelativeString(event?.startLocal)}
      </div>
      {!event.noRsvp && (
        <div className="truncate">
          <i className="fa-solid fa-user fa-fw" />
          &nbsp;
          {numberOf(event.participants)}
        </div>
      )}
    </div>
  );
}
