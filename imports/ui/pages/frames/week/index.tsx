import React, { useState } from "react";
import { chain } from "lodash-es";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useUserId } from "/imports/utils/react-meteor-data";

import moment from "moment";

import { EventModel, Events } from "/imports/api/events/events";
import { useFindFilter } from "/imports/api/events/publications";

import { reactiveNow } from "/imports/utils/reactive-now";
import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import { MetaTags } from "/imports/ui/components/MetaTags";

import { AccountTasks } from "/imports/ui/components/account-tasks";
import {
  CalendarNavWeek,
  Props as CalendarNavData,
} from "/imports/ui/components/calendar-nav/week";
import { EventList } from "/imports/ui/components/events/list";
import { LoadingRow } from "../../loading";

import "./template.html";
import "./styles.scss";

const DefaultLimit = 200;

interface Weekday {
  date: moment.Moment;
  dayEvents: EventModel[];
}

export function WeekPage(props: Record<string, string>) {
  const { t } = useTranslation();
  const { calendarDayFormat } = useDateTimeFormat();
  const userId = useUserId();
  const [isAttendeeFilterOn, setIsAttendeeFilterOn] = useState(false);

  const filter = Events.Filtering().read(props);

  const date = filter.get("after") || moment(reactiveNow.get());

  const startOfWeek = date.startOf("week");

  const filterQuery = filter.toQuery();

  // filter isAttendeeFilterOn in addition to filtering that get's passed in via url
  if (userId && isAttendeeFilterOn) {
    filterQuery.participant = userId;
  }

  if (startOfWeek) {
    filterQuery.after = startOfWeek.toDate();
    filterQuery.end = moment(startOfWeek).add(1, "week").toDate();
  }

  const limit =
    new Filtering({
      count: Predicates.integer,
    })
      .read(props)
      .toQuery().count || DefaultLimit;

  const [isLoading, events] = useFindFilter(filterQuery, limit + 1);

  function control() {
    return props.control === "1";
  }

  function calendarNavAttr(): CalendarNavData {
    return {
      hideSwitches: props.hideSwitches === "1",
      search: filter.get("search") ?? "",
      onChangeSearch: (newValue: string) => {
        filter.set("search", newValue);
        update();
      },
      date: startOfWeek,
      onChangeDate: (newDate) => {
        filter.set("after", newDate.startOf("week"));
        update();
      },
      availableOrganizations:
        new Filtering({
          filterOrganizations: Predicates.ids,
        })
          .read(props)
          .get("filterOrganizations") ?? [],
      selectedOrganizations: filter.get("organizations") ?? [],
      onChangeOrganizations: (organizations) => {
        filter.set("organizations", organizations);
        update();
      },
      categories: filter.get("categories") ?? [],
      onChangeCategories: (categories) => {
        filter.set("categories", categories);
        update();
      },
      attendingEventsOnly: isAttendeeFilterOn,
      onChangeAttendingEventsOnly: (state) => {
        setIsAttendeeFilterOn(state);
      },
    };
  }

  function hasDayEvents(weekday: Weekday) {
    return weekday.dayEvents.length > 0;
  }

  function weekdays() {
    const start = startOfWeek;
    const end = moment(start).add(1, "week");

    const weekdays = [];
    let current = moment(start);
    while (current.isBefore(end)) {
      const next = moment(current).add(1, "day");
      const after = current.toDate();
      const end = next.toDate();

      weekdays.push({
        date: current,
        dayEvents: chain(events)
          .filter((e) => e.start > after && e.start <= end)
          .take(limit)
          .value(),
      });
      current = next;
    }
    return weekdays;
  }

  function update() {
    const query: Record<string, string> = filter.toParams();
    query.count = limit.toString();
    if (props.control) {
      query.control = props.control;
    } else {
      delete query.control;
    }
    if (props.hideSwitches) {
      query.hideSwitches = props.hideSwitches;
    } else {
      delete query.hideSwitches;
    }
    if (props.filterOrganizations) {
      query.filterOrganizations = props.filterOrganizations;
    } else {
      delete query.filterOrganizations;
    }
    delete query.region; // HACK region is kept in the session (for bad reasons)

    Router.go(Router.current().route.getName(), {}, { query });
  }

  return (
    <>
      <MetaTags title={t("calendar.windowtitle", "Calendar")} />

      <AccountTasks />
      {control() && <CalendarNavWeek {...calendarNavAttr()} />}
      <div className="py-4">
        {weekdays().map((weekday) => (
          <>
            <div className="js-calendar-date frame-week-date">
              {calendarDayFormat(weekday.date)}
            </div>
            <div className="frame-week-date-events">
              {!isLoading() ? (
                hasDayEvents(weekday) ? (
                  <EventList
                    dataEvents={weekday.dayEvents}
                    withDate={false}
                    withImage={true}
                    openInNewTab={true}
                  />
                ) : (
                  <div className="text-center">
                    {t("frameCalendar.nothingOnThisDay", "Relax, nothing happening today.")}
                  </div>
                )
              ) : (
                <LoadingRow />
              )}
            </div>
          </>
        ))}
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FrameWeekPage", () => WeekPage);
