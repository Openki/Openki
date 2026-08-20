import React from "react";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { GroupModel } from "/imports/api/groups/groups";

import "./styles.scss";

export function GroupCompactEvent({ event }: { event: NonNullable<GroupModel["nextEvent"]> }) {
  const { dateShort, timeFormat, dateToRelativeString } = useDateTimeFormat();

  return (
    <div className="group-compact-next-event col">
      {!!event.venue?.name && (
        <div className="truncate">
          <i className="fa-solid fa-house fa-fw" />
          &nbsp;{event.venue.name}
        </div>
      )}
      <div className="truncate">
        <i className="fa-regular fa-clock fa-fw" />
        &nbsp;
        <span title={`${dateShort(event?.startLocal)} ${timeFormat(event?.startLocal)}`}>
          {dateToRelativeString(event?.startLocal)}
        </span>
      </div>
      {!event.noRsvp && (
        <div className="truncate">
          <i className="fa-solid fa-user fa-fw" />
          &nbsp;
          {event?.numberOfParticipants()}
        </div>
      )}
    </div>
  );
}
