import React from "react";

import { CourseModel } from "/imports/api/courses/courses";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import "./styles.scss";

export function CourseCompactEvent(props: { course: CourseModel }) {
  const { nextEvent } = props.course;
  const { dateShort, timeFormat, dateToRelativeString } = useDateTimeFormat();

  return (
    <div className="course-compact-next-event col">
      {nextEvent?.venue?.name ? (
        <div className="course-compact-next-event-component">
          <i className="fa-solid fa-house fa-fw" aria-hidden="true"></i>&nbsp;{nextEvent.venue.name}
        </div>
      ) : null}
      <div className="course-compact-next-event-component">
        <i className="fa-regular fa-clock fa-fw" aria-hidden="true"></i>&nbsp;
        <span title={`${dateShort(nextEvent?.startLocal)} ${timeFormat(nextEvent?.startLocal)}`}>
          {dateToRelativeString(nextEvent?.startLocal)}
        </span>
      </div>
      {!nextEvent?.noRsvp ? (
        <div className="course-compact-next-event-component">
          <i className="fa-solid fa-user fa-fw" aria-hidden="true"></i>&nbsp;
          {nextEvent?.numberOfParticipants()}
        </div>
      ) : null}
    </div>
  );
}
