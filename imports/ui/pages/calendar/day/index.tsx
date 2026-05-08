import React from "react";
import moment from "moment";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { EventModel, Events } from "/imports/api/events/events";

import { EventList } from "/imports/ui/components/events/list";

import "./styles.scss";

export function Day(data: {
  date: moment.Moment;
  events: EventModel[];
  filter: ReturnType<(typeof Events)["Filtering"]>;
  isAttendeeFilterOn: boolean;
}) {
  const { t } = useTranslation();
  const userId = useUserId();
  const { calendarDayFormat } = useDateTimeFormat();

  function maybeFilteredEvents(filters: { isAttendeeFilterOn: boolean }) {
    let evs = [...data.events];
    if (filters.isAttendeeFilterOn && userId) {
      evs = evs.filter((event) => event.attendedBy(userId));
    }
    return evs;
  }

  return (
    <>
      <div className="js-calendar-date calendar-date">{calendarDayFormat(data.date)}</div>
      {maybeFilteredEvents({
        isAttendeeFilterOn: data.isAttendeeFilterOn,
      }).length > 0 ? (
        <div className="calendar-event-list">
          <EventList
            dataEvents={maybeFilteredEvents({
              isAttendeeFilterOn: data.isAttendeeFilterOn,
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
