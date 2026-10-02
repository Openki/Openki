import React from "react";
import { useSession } from "/imports/ui/hooks/react-meteor-data";
import { Router } from "meteor/iron:router";
import moment from "moment";
import { useSearchParams } from "/imports/utils/react-meteor-router";
import { useReactiveNow } from "/imports/utils/reactive-now";
import { LocalTime } from "/imports/utils/local-time";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/ui/hooks/useDateTimeFormat";
import { chain, sortBy, fromPairs } from "lodash-es";

import { useFindFilter } from "/imports/api/events/publications";
import { EventEntity, Events } from "/imports/api/events/events";

import "./styles.scss";

type EventViewModel = EventEntity & {
  repKeyDay: string;
  repKey: string;
  repCount: number;
};

function useOptions() {
  const now = useReactiveNow();
  const searchParams = useSearchParams();
  const filter = Events.Filtering();

  let interval: number;

  // Read query params
  const query = searchParams;

  const repeatingOnly = Object.prototype.hasOwnProperty.call(query, "repeating");

  let scheduleStart: moment.Moment | undefined = undefined;
  if (query.start) {
    scheduleStart = moment(query.start);
  }
  if (!scheduleStart || !scheduleStart.isValid()) {
    scheduleStart = moment(now).startOf("week");
  }

  const seps = chain(query.sep || "")
    .split(",")
    .filter((sep) => sep.length > 0) // get rid of 0-length
    .map((sep) => {
      if (sep.length < 3) {
        return Number.parseInt(`${sep}00`, 10);
      }
      return Number.parseInt(sep, 10);
    }) // standardize format
    .filter((hm) => !Number.isNaN(hm)) // filter NaN's
    .map((hm) => {
      const h = Math.floor(hm / 100);
      const m = hm % 100;
      return h * 60 + m;
    }) /* convert to minutes */
    .uniq()
    .value();
  const separators = seps;

  const readInterval = Number.parseInt(query.interval || "", 10);
  if (!Number.isNaN(readInterval) && readInterval > 0) {
    interval = readInterval;
  } else if (seps.length > 0) {
    interval = 24 * 60;
  } else {
    interval = 60;
  }

  filter.read(query);
  filter.set("after", scheduleStart);
  filter.set("end", moment(scheduleStart).add(4, "week"));

  return {
    scheduleStart,
    separators,
    interval,
    repeatingOnly,
    filter: filter.toQuery(),
  };
}

export function Schedule() {
  const { t } = useTranslation();
  const { dateFormat } = useDateTimeFormat();
  const timeLocale = useSession("timeLocale") || "en";

  const { scheduleStart, separators, interval, repeatingOnly, filter } = useOptions();

  const [isLoading, events] = useFindFilter(filter, 500);

  // Track repeating events so we know how often they occur.
  // The key to this dict is a combination of groupId, weekday and start time.
  const repetitionCount: Record<string, number> = {};
  const repetitionCountDay: Record<string, number> = {};

  if (isLoading()) {
    return null;
  }

  // Load events but keep only the first when they repeat on the same
  // weekday at the same time.
  const dedupedEvents: EventViewModel[] = [];
  events.forEach((originalEvent) => {
    const event = { ...originalEvent } as EventViewModel;
    const eventStart = LocalTime.fromString(event.startLocal);

    // Build key that is the same for events of the same group that
    // start on the same time.
    let repKey = `${eventStart.hour()}-${eventStart.minute()}-`;

    // If there is no groupId, we fall back to replicationId, then _id.
    if (event.groupId) {
      repKey += event.groupId;
    } else if (event.replicaOf) {
      repKey += event.replicaOf;
    } else {
      repKey += event._id;
    }

    if (repetitionCount[repKey] >= 1) {
      repetitionCount[repKey] += 1;
    } else {
      repetitionCount[repKey] = 1;
    }

    const repKeyDay = `${eventStart.day()}-${repKey}`;
    if (repetitionCountDay[repKeyDay] >= 1) {
      repetitionCountDay[repKeyDay] += 1;
    } else {
      repetitionCountDay[repKeyDay] = 1;

      event.repKey = repKey;
      event.repKeyDay = repKeyDay;
      dedupedEvents.push(event);
    }
  });

  // Because we need to find the closest separator later on we use reverse which is easier to search.
  // List of intervals where events or separators are placed
  const intervalsDic = separators
    .reverse()
    .reduce((rIntervals: Record<number, number>, separator) => {
      rIntervals[separator] = separator;
      return rIntervals;
    }, {});

  // List of days where events where found
  const daysDic: Record<string, number> = {};

  // Map of slots where events were found. Each slot holds a list of events.
  const slots: Record<string, Record<string, EventViewModel[]>> = {};

  // Count occurences of first few chars in event titles
  // This helps coloring the events so they're easier to scan.
  const kinds: Record<string, number> = {};

  // Place found events into the slots
  dedupedEvents.forEach((originalEvent) => {
    const event = { ...originalEvent };
    const eventStart = LocalTime.fromString(event.startLocal);

    event.repCount = repetitionCountDay[event.repKeyDay];
    if (event.repCount < 2 && repeatingOnly) {
      // Skip
      return;
    }

    const dayStart = moment(eventStart).startOf("day");

    const day = dayStart.diff(scheduleStart, "days") % 7;
    daysDic[day] = day;

    const minuteDiff = eventStart.diff(dayStart, "minutes");
    const intervalStart = Math.floor(minuteDiff / interval) * interval;
    const closestSeparator = separators.find((sep) => sep <= minuteDiff);

    const mins = Math.max(intervalStart, closestSeparator || 0);
    intervalsDic[mins] = mins;

    if (!slots[`${mins}`]) {
      slots[`${mins}`] = {};
    }
    if (!slots[`${mins}`][`${day}`]) {
      slots[`${mins}`][`${day}`] = [];
    }

    slots[`${mins}`][`${day}`].push(event);

    const kindId = event.title.substring(0, 5);
    if (!kinds[kindId]) {
      kinds[kindId] = 1;
    }
    kinds[kindId] += 1;
  });

  const numCmp = function (a: number, b: number) {
    return a - b;
  };
  const days = Object.values(daysDic).sort(numCmp);
  const intervals = Object.values(intervalsDic).sort(numCmp);

  // Build list of most used titles (first few chars)
  const mostUsedKinds = sortBy(Object.entries(kinds), (kv) => -kv[1]);
  const kindRank = fromPairs(mostUsedKinds.slice(0, 15).map((kv, rank) => [kv[0], rank + 1]));
  const kindMap = function (title: string) {
    const kindId = title.substring(0, 5);
    if (kindRank[kindId]) {
      return kindRank[kindId];
    }
    return false;
  };

  Object.entries(slots).forEach(([min, dayslots]) => {
    Object.entries(dayslots).forEach(([day, slot]) => {
      slots[min][day] = sortBy(slot, (event) => {
        const dayslotKindRank = (kindMap(event.title) || 100) + 100;
        const countRank = 10000 - repetitionCount[event.repKey];
        // We add repetitionCount to the sort criteria so that the
        // output hopefully looks more stable through the weekdays
        // with events occurring every weekday listed first in
        // each slot
        return `${100 + LocalTime.fromString(event.startLocal).toDate().getHours()}-${
          100 + LocalTime.fromString(event.startLocal).toDate().getMinutes()
        }-${dayslotKindRank}-${countRank}-${event.title}`;
      });
    });
  });

  function displayMonth() {
    return moment(scheduleStart).locale(timeLocale).format("MMMM");
  }
  function displayDays() {
    return days.map((day) =>
      moment(scheduleStart).add(day, "days").locale(timeLocale).format("dddd"),
    );
  }
  function displayIntervals() {
    return intervals.map((mins) => {
      const intervalStart = moment().locale(timeLocale).hour(0).minute(mins);
      return {
        intervalStart,
        intervalLabel: intervalStart.format("LT"),
        slots: days.map((day) => (slots[mins] && slots[mins][day]) || []),
      };
    });
  }
  function type(event: EventViewModel) {
    return kindMap(event.title) || "other";
  }
  function customStartTime(event: EventViewModel, intervalStart: moment.Moment) {
    const startTime = LocalTime.fromString(event.startLocal);
    startTime.locale(intervalStart.locale());
    const isSame =
      startTime.hours() === intervalStart.hours() &&
      startTime.minutes() === intervalStart.minutes();
    return isSame ? false : startTime.format("LT");
  }
  function single(event: EventViewModel) {
    return event.repCount < 2;
  }
  function showDate(event: EventViewModel) {
    // The date is shown if an event has no repetitions...
    if (event.repCount < 2) {
      return true;
    }

    // ... or if it doesn't occur this week.
    const oneWeekAfterScheduleStart = moment(scheduleStart).add(1, "week");
    return moment(event.startLocal).isAfter(oneWeekAfterScheduleStart);
  }

  return (
    <table className="schedule">
      <thead>
        <tr>
          <th className="schedule-header-time" scope="col">
            {displayMonth()}
          </th>
          {displayDays().map((day) => (
            <th key={day} className="schedule-header-day" scope="col">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {displayIntervals().map((inverval) => (
          <tr key={inverval.intervalStart.valueOf()}>
            <td className="schedule-time" scope="row">
              <div className="schedule-time-interval">{inverval.intervalLabel}</div>
            </td>
            {inverval.slots.map((slot, index) => (
              <td key={index} className="schedule-slot">
                {slot.map((event) => (
                  <a
                    key={event._id}
                    href={Router.path("showEvent", event)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className={`schedule-event schedule-event-type-${type(event)}`}>
                      {event.title}
                      {showDate(event) && (
                        <>
                          <br />
                          <span className="schedule-event-time">
                            {!single(event) && <>{t("schedule.startDateLabel", "start:")} </>}
                            {dateFormat(event.startLocal)}
                          </span>
                        </>
                      )}
                      {!!customStartTime(event, inverval.intervalStart) && (
                        <>
                          <br />
                          <span className="schedule-event-time">
                            {customStartTime(event, inverval.intervalStart)}
                          </span>
                        </>
                      )}
                    </div>
                  </a>
                ))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FrameSchedulePage", () => Schedule);
