import React, { useEffect, useState } from "react";
import { Mongo } from "meteor/mongo";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useUserId } from "/imports/utils/react-meteor-data";

import moment from "moment";

import { EventEntity, EventModel, Events } from "/imports/api/events/events";
import { useFindFilter } from "/imports/api/events/publications";

import * as UrlTools from "/imports/utils/url-tools";
import { reactiveNow } from "/imports/utils/reactive-now";
import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import * as Metatags from "/imports/utils/metatags";

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
  dayEvents: Mongo.Cursor<EventEntity, EventModel>;
}

export function WeekPage(data: Record<string, string>) {
  const { t } = useTranslation();
  const { calendarDayFormat } = useDateTimeFormat();
  const userId = useUserId();
  const [isAttendeeFilterOn, setIsAttendeeFilterOn] = useState(false);

  const filter = Events.Filtering().read(data);

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
      .read(data)
      .toQuery().count || DefaultLimit;

  const [isLoading] = useFindFilter(filterQuery, limit + 1);

  function control() {
    return data.control === "1";
  }

  function calendarNavAttr() {
    return {
      hideSwitches: data.hideSwitches === "1",
      search: filter.get("search"),
      onChangeSearch: (newValue: string) => {
        filter.add("search", newValue);
        update();
      },
      date: startOfWeek,
      onChangeDate: (newDate) => {
        filter.add("after", newDate.startOf("week").toISOString());
        update();
      },
      availableGroups: new Filtering({
        filterGroups: Predicates.ids,
      })
        .read(data)
        .get("filterGroups"),
      selectedGroups: filter.get("groups"),
      onAddGroup: (group) => {
        filter.add("groups", group);
        update();
      },
      onRemoveGroup: (group) => {
        filter.remove("groups", group);
        update();
      },
      categories: filter.get("categories"),
      onAddCategory: (category) => {
        filter.add("categories", category);
        update();
      },
      onRemoveCategory: (category) => {
        filter.remove("categories", category);
        update();
      },
      onChangeAttendingEventsOnly: (state) => {
        setIsAttendeeFilterOn(state);
      },
    } as CalendarNavData;
  }

  function hasDayEvents(weekday: Weekday) {
    return weekday.dayEvents.count() > 0;
  }

  function weekdays() {
    const filter = Events.Filtering().read(data);

    const start = startOfWeek;
    const end = moment(start).add(1, "week");

    const weekdays = [];
    let current = moment(start);
    while (current.isBefore(end)) {
      const next = moment(current).add(1, "day");
      const filterQuery = filter.toQuery();
      filterQuery.after = current.toDate();
      filterQuery.end = next.toDate();

      weekdays.push({
        date: current,
        dayEvents: Events.findFilter(filterQuery, limit),
      });
      current = next;
    }
    return weekdays;
  }

  useEffect(() => {
    Metatags.setCommonTags(t("calendar.windowtitle", "Calendar"));
  });

  function update() {
    const filterParams = filter.toParams() as Record<string, string>;
    filterParams.count = limit.toString();
    if (data.control) {
      filterParams.control = data.control;
    } else {
      delete filterParams.control;
    }
    if (data.hideSwitches) {
      filterParams.hideSwitches = data.hideSwitches;
    } else {
      delete filterParams.hideSwitches;
    }
    if (data.filterGroups) {
      filterParams.filterGroups = data.filterGroups;
    } else {
      delete filterParams.filterGroups;
    }
    delete filterParams.region; // HACK region is kept in the session (for bad reasons)
    const queryString = UrlTools.paramsToQueryString(filterParams);

    const options: { query?: string } = {};
    if (queryString.length) {
      options.query = queryString;
    }

    Router.go(Router.current().route.getName(), {}, options);
  }

  return (
    <>
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
                    dataEvents={weekday.dayEvents.fetch()}
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
