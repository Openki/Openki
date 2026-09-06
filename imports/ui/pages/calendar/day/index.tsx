import React from "react";
import moment from "moment";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { EventModel } from "/imports/api/events/events";

import { EventList } from "/imports/ui/components/events/list";

import "./styles.scss";

export function Day({
  date,
  events,
  isAttendeeFilterOn,
}: {
  date: moment.Moment;
  events: EventModel[];
  isAttendeeFilterOn: boolean;
}) {
  const { t } = useTranslation();
  const userId = useUserId();
  const { calendarDayFormat } = useDateTimeFormat();

  function maybeFilteredEvents(filters: { isAttendeeFilterOn: boolean }) {
    let evs = [...events];
    if (filters.isAttendeeFilterOn && userId) {
      evs = evs.filter((event) => event.attendedBy(userId));
    }
    return evs;
  }

  return (
    <>
      <div className="js-calendar-date calendar-date">{calendarDayFormat(date)}</div>
      {maybeFilteredEvents({
        isAttendeeFilterOn,
      }).length > 0 ? (
        <div className="calendar-event-list">
          <EventList
            dataEvents={maybeFilteredEvents({
              isAttendeeFilterOn,
            })}
            withDate={false}
            withImage={true}
          />
        </div>
      ) : (
        <>
          <br />
          {t("calendar.noGroupsThisDay", "There are no events on this day")}
        </>
      )}
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CalendarDay", () => Day);
