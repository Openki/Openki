import React from "react";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { GroupNextEventEntity } from "/imports/api/courses/courses";
import { OEvent } from "/imports/api/events/events";

import "./styles.scss";

export function GroupCompactEvent(props: { event: GroupNextEventEntity & OEvent }) {
  const { event } = props;
  const { dateShort, timeFormat, dateToRelativeString } = useDateTimeFormat();

  return (
    <div className="course-compact-next-event col">
      {!!event.venue?.name && (
        <div className="course-compact-next-event-component">
          <i className="fa-solid fa-house fa-fw" />
          &nbsp;{event.venue.name}
        </div>
      )}
      <div className="course-compact-next-event-component">
        <i className="fa-regular fa-clock fa-fw" />
        &nbsp;
        <span title={`${dateShort(event?.startLocal)} ${timeFormat(event?.startLocal)}`}>
          {dateToRelativeString(event?.startLocal)}
        </span>
      </div>
      {!event.noRsvp && (
        <div className="course-compact-next-event-component">
          <i className="fa-solid fa-user fa-fw" />
          &nbsp;
          {event?.numberOfParticipants()}
        </div>
      )}
    </div>
  );
}
