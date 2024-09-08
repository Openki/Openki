/* eslint-disable no-nested-ternary */
import React from "react";
import moment from "moment";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { EventModel, Events } from "/imports/api/events/events";

import { EventList } from "/imports/ui/components/events/list";

import "./styles.scss";

export function Day(data: {
  day: {
    date: moment.Moment;
    events: EventModel[];
  };
  filter: ReturnType<(typeof Events)["Filtering"]>;
  isAttendeeFilterOn: boolean;
}) {
  const { t } = useTranslation();
  const userId = useUserId();
  const { calendarDayFormat } = useDateTimeFormat();

  function hasEvents() {
    return data.day.events.length > 0;
  }

  function maybeFilteredEvents(filters: { hash: { isAttendeeFilterOn: boolean } }) {
    let evs = [...data.day.events];
    if (filters.hash.isAttendeeFilterOn && userId) {
      evs = evs.filter((event) => event.attendedBy(userId));
    }
    return evs;
  }

  return (
    <>
      <div className="js-calendar-date calendar-date">{calendarDayFormat(data.day.date)}</div>
      {hasEvents() ? (
        <div className="calendar-event-list">
          <EventList
            dataEvents={maybeFilteredEvents({
              hash: { isAttendeeFilterOn: data.isAttendeeFilterOn },
            })}
            withDate={false}
            withImage={true}
          />
          {/* maybeFilteredEvents is a template helper that gives back a list of events in function of two arguments: events and isAttendeeFilterOn */}
        </div>
      ) : (
        <>
          <br />
          {t("calendar.noCoursesThisDay", "There are no events on this day")}
        </>
      )}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CalendarDay", () => Day);
