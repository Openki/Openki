/* eslint-disable no-nested-ternary */
import React from "react";
import moment from "moment";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { useFindFilter } from "/imports/api/events/publications";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { Events, FindFilter } from "/imports/api/events/events";

import { EventList } from "/imports/ui/components/events/list";

import "./styles.scss";

export function Day(data: {
  day: {
    start: moment.Moment;
    end: moment.Moment;
  };
  filter: ReturnType<(typeof Events)["Filtering"]>;
  isAttendeeFilterOn: boolean;
}) {
  const { t } = useTranslation();
  const userId = useUserId();
  const { calendarDayFormat } = useDateTimeFormat();

  const filterQuery: FindFilter = data.filter.toQuery();
  filterQuery.period = [data.day.start.toDate(), data.day.end.toDate()];
  const [isLoading, events] = useFindFilter(filterQuery);

  function hasEvents() {
    return events.length > 0;
  }

  function maybeFilteredEvents(filters: { hash: { isAttendeeFilterOn: boolean } }) {
    let evs = [...events];
    if (filters.hash.isAttendeeFilterOn && userId) {
      evs = evs.filter((event) => event.attendedBy(userId));
    }
    return evs;
  }

  return (
    <>
      <div className="js-calendar-date calendar-date">{calendarDayFormat(data.day.start)}</div>
      {!isLoading() ? (
        hasEvents() ? (
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
        )
      ) : null}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CalendarDay", () => Day);
