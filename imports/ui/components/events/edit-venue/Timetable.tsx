import chain from "lodash/chain";
import sumBy from "lodash/sumBy";
import { Router } from "meteor/iron:router";
import moment, { max, min } from "moment";
import React, { useEffect, useMemo, useRef } from "react";
import * as Events from "/imports/api/events/publications";
import { useDetails as useVenueDetails } from "/imports/api/venues/publications";
import { useFindParallelEvents } from "/imports/ui/components/events/edit/useFindParallelEvents";
import { useLocalTimeZone } from "/imports/utils/local-time";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

function ScrollIntoView({ children }: { children: React.ReactNode }) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    elementRef.current?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "instant",
      container: "nearest",
    } as any);
  }, [elementRef?.current]);

  return <div ref={elementRef}>{children}</div>;
}

export function useFindNearEvents(
  venueId: string | undefined,
  regionId: string,
  event: {
    _id?: string | undefined;
    room?: string | undefined;
    startLocal: string;
    endLocal: string;
  },
): {
  _id?: string | undefined;
  title?: string | undefined;
  room?: string | undefined;
  startLocal: string;
  endLocal: string;
}[] {
  const regionZone = useLocalTimeZone(regionId);

  const start = regionZone.fromString(event.startLocal);
  const end = regionZone.fromString(event.endLocal);

  const [isLoading, events] = Events.useFindFilter({
    venue: venueId || "-1",
    period: [start.subtract(18, "hours").toDate(), end.add(18, "hours").toDate()],
    canceled: false,
  });

  // cache to prevent endless recalls
  return useMemo(() => {
    if (isLoading()) {
      return [];
    }

    /* replace with current event state */
    return [...events.filter((e) => e._id !== event._id), event];
  }, [venueId, regionId, event.room, event.startLocal, event.endLocal, isLoading()]);
}

function getDaysBetween(startDate: moment.MomentInput, endDate: moment.MomentInput) {
  const start = moment(startDate);
  const end = moment(endDate);
  const days = [];

  // Loop from start to end, inclusive
  while (start.isSameOrBefore(end, "day")) {
    days.push(start.clone());
    start.add(1, "day");
  }

  return days;
}

function getHoursBetween(startDate: moment.MomentInput, endDate: moment.MomentInput) {
  const start = moment(startDate);
  const end = moment(endDate);
  const hours = [];

  // Loop from start to end, inclusive
  while (start.isSameOrBefore(end, "hour")) {
    hours.push(start.clone());
    start.add(1, "hour");
  }

  return hours;
}

export function Timetable({
  venueId,
  regionId,
  event: currentEvent,
}: {
  venueId: string | undefined;
  regionId: string;
  event: {
    _id?: string | undefined;
    room?: string | undefined;
    startLocal: string;
    endLocal: string;
  };
}) {
  const hourSize = 60;

  const { dateLong, timeFormat } = useDateTimeFormat();

  const regionZone = useLocalTimeZone(regionId);

  const [venueIsLoading, venue] = useVenueDetails(venueId || "-1");
  const events = useFindNearEvents(venueId, regionId, currentEvent);
  const parallelEvents = useFindParallelEvents(venueId, regionId, currentEvent);

  const startLocal = chain(events)
    .map((e) => e.startLocal)
    .min()
    .value();
  const endLocal = chain(events)
    .map((e) => e.endLocal)
    .max()
    .value();

  let start = regionZone.fromString(startLocal);
  // show in min +/- 5 hours free time space before and after event
  const maxStart = regionZone.fromString(currentEvent.startLocal).subtract(5, "hour");
  start = min(start, maxStart);

  let end = regionZone.fromString(endLocal);
  const minEnd = regionZone.fromString(currentEvent.endLocal).add(5, "hour");
  end = max(minEnd, end);

  let pos = 2;
  const viewModel = getDaysBetween(start, end).map((day) => {
    const startHour = max(start, day.clone().startOf("day"));
    const endHour = min(day.clone().endOf("day"), end);

    const hours = getHoursBetween(
      startHour.clone().startOf("hour"),
      endHour.clone().startOf("hour"),
    );

    const startPos = pos;
    const endPos = pos + hours.length;
    pos = endPos;

    return {
      day,
      hours,
      start: startPos,
      end: endPos,
    };
  });

  const rooms = chain(events)
    .groupBy((e) => e.room?.toUpperCase() || "")
    .orderBy((g) => g[0].room)
    .value();

  const totalCols = sumBy(viewModel, (v) => v.hours.length) + 1; // +1 for first empty/room column

  if (events.length <= 1) {
    // only show if more then 1 event found
    return null;
  }

  const inSameRoom = parallelEvents.find(
    (e) => e.room && currentEvent.room && e.room.toUpperCase() === currentEvent.room.toUpperCase(),
  );

  let state;
  if (parallelEvents.length > 0) {
    if (inSameRoom || !(!venueIsLoading() && venue?.allowParallelEvents)) {
      state = "danger";
    } else {
      state = "warning";
    }
  } else {
    state = "success";
  }

  return (
    <div
      className="overflow-x-auto bg-white"
      style={{
        display: "grid",
        gridTemplateColumns: `max-content repeat(${totalCols - 1}, ${hourSize}px)`,
        gap: "0",
      }}
    >
      {/* Days Row */}
      {viewModel.map(({ day, start, end }) => (
        <div
          key={day.valueOf()}
          className="text-center"
          style={{ gridColumn: `${start} / ${end}` }}
        >
          <span className="px-1" style={{ position: "sticky", left: 0, right: 0 }}>
            {dateLong(day)}
          </span>
        </div>
      ))}

      {/* Hours Row */}
      {viewModel.map(({ hours, start }) =>
        hours.map((hour, index) => (
          <div
            key={hour.valueOf()}
            className="border-start px-1"
            style={{ gridColumn: `${start + index}` }}
          >
            {timeFormat(hour)}
          </div>
        )),
      )}

      {/* Room & Events */}
      {Object.values(rooms).map((r, id) => (
        <React.Fragment key={id}>
          <div
            className="position-sticky bg-white text-truncate px-1"
            data-bs-title={r[0].room}
            style={{
              zIndex: 2,
              insetInlineStart: 0,
              maxWidth: `${hourSize * 2}px`,
            }}
          >
            {r[0].room || <>&nbsp;</>}
          </div>
          {viewModel.map(({ hours, start }) =>
            hours.map((hour, index) => (
              <div
                key={hour.valueOf()}
                className="position-relative overflow-visible border-start"
                style={{ gridColumn: `${start + index}` }}
              >
                {r
                  .filter((event) => regionZone.fromString(event.startLocal).isSame(hour, "hour"))
                  .map((event) => {
                    return event._id === currentEvent._id ? (
                      <ScrollIntoView key={event._id}>
                        <div
                          className={`position-absolute bg-${state} opacity-75`}
                          style={{
                            marginLeft: `${(regionZone.fromString(event.startLocal).minutes() / 60) * hourSize}px`,
                            minWidth:
                              (regionZone.fromString(event.endLocal).valueOf() -
                                regionZone.fromString(event.startLocal).valueOf()) /
                              1000 /
                              60,
                          }}
                        >
                          &nbsp;
                        </div>
                      </ScrollIntoView>
                    ) : (
                      <div
                        key={event._id}
                        className={"position-absolute bg-dark opacity-25"}
                        style={{
                          marginLeft: `${(regionZone.fromString(event.startLocal).minutes() / 60) * hourSize}px`,
                          minWidth:
                            (regionZone.fromString(event.endLocal).valueOf() -
                              regionZone.fromString(event.startLocal).valueOf()) /
                            1000 /
                            60,
                          zIndex: 1,
                        }}
                      >
                        <a
                          className="stretched-link"
                          href={Router.path("showEvent", event)}
                          target="_blank"
                          rel="noreferrer"
                          title={event.title}
                        >
                          &nbsp;
                        </a>
                      </div>
                    );
                  })}
              </div>
            )),
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
