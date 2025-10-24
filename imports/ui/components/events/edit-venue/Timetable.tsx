import moment, { max, min } from "moment";
import React, { useMemo } from "react";
// import { useTranslation } from "react-i18next";
// import { EventModel } from "/imports/api/events/events";
import * as Events from "/imports/api/events/publications";
// import { useDetails as useVenueDetails } from "/imports/api/venues/publications";
import { chain, groupBy, sumBy } from "lodash";
import { useLocalTimeZone } from "/imports/utils/local-time";
// import { useUser } from "/imports/utils/react-meteor-data";
import { Router } from "meteor/iron:router";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

export function useFindNearEvents(
  venueId: string | undefined,
  regionId: string,
  event: {
    _id?: string | undefined;
    room?: string | undefined;
    startLocal: string;
    endLocal: string;
  },
) {
  const regionZone = useLocalTimeZone(regionId);

  const start = regionZone.fromString(event.startLocal);
  const end = regionZone.fromString(event.endLocal);

  const [isLoading, events] = Events.useFindFilter({
    venue: venueId || "-1",
    period: [start.subtract(18, "hours").toDate(), end.add(18, "hours").toDate()],
  });

  // cache to prevent endless recalls
  return useMemo(() => {
    if (isLoading()) {
      return [];
    }

    /* replace with current event state */
    return [...events.filter((e) => e._id !== event._id), event];
  }, [venueId, regionId, event.startLocal, event.endLocal, isLoading()]);
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
  // const hourSize = 60;

  // const { t } = useTranslation();
  const { dateLong, timeFormat } = useDateTimeFormat();

  const regionZone = useLocalTimeZone(regionId);

  // const [venueIsLoading, venue] = useVenueDetails(venueId || "-1");
  const events = useFindNearEvents(venueId, regionId, currentEvent);

  const startLocal = chain(events)
    .map((e) => e.startLocal)
    .min()
    .value();
  const endLocal = chain(events)
    .map((e) => e.endLocal)
    .max()
    .value();

  const start = regionZone.fromString(startLocal);
  const end = regionZone.fromString(endLocal);

  let pos = 2;
  const viewModel = getDaysBetween(start, end).map((day) => {
    const startHour = max(start, day.clone().startOf("day"));
    const endHour = min(day.clone().endOf("day"), end);

    const hours = getHoursBetween(startHour, endHour);

    const startPos = pos;
    const endPos = pos + hours.length;
    pos = endPos;

    return {
      day,
      hours: getHoursBetween(startHour, endHour),
      start: startPos,
      end: endPos,
    };
  });

  const rooms = chain(events)
    .groupBy((e) => e.room?.toUpperCase() || "")
    .orderBy((g) => g[0].room)
    .value();

  const totalCols = sumBy(viewModel, (v) => v.hours.length) + 1; // +1 for first empty/room column

  return (
    <div
      className="overflow-x-auto bg-white"
      style={{
        display: "grid",
        gridTemplateColumns: `25% repeat(${totalCols - 1}, 60px)`,
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
          {dateLong(day)}
        </div>
      ))}

      {/* Hours Row */}
      {viewModel.map(({ hours, start }) =>
        hours.map((hour, index) => (
          <div key={hour.valueOf()} style={{ gridColumn: `${start + index}` }}>
            {timeFormat(hour)}
          </div>
        )),
      )}

      {/* Room & Events */}
      {Object.values(rooms).map((r, id) => (
        <React.Fragment key={id}>
          <div
            className="position-sticky bg-white text-truncate"
            style={{
              zIndex: 1,
              insetInlineStart: 0,
            }}
          >
            {r[0].room || <>&nbsp;</>}
          </div>
          {viewModel.map(({ hours, start }) =>
            hours.map((hour, index) => (
              <div
                key={hour.valueOf()}
                className="position-relative overflow-visible"
                style={{ gridColumn: `${start + index}` }}
              >
                {r
                  .filter((event) => regionZone.fromString(event.startLocal).isSame(hour, "hour"))
                  .map((event) => (
                    <div
                      key={event._id}
                      className={
                        "position-absolute " +
                        (event._id === currentEvent._id ? "bg-success" : "bg-secondary")
                      }
                      style={{
                        marginLeft: regionZone.fromString(event.startLocal).minutes() + "px",
                        minWidth:
                          (regionZone.fromString(event.endLocal).valueOf() -
                            regionZone.fromString(event.startLocal).valueOf()) /
                          1000 /
                          60,
                      }}
                    >
                      <a href={Router.path("showEvent", event)}>&nbsp;</a>
                    </div>
                  ))}
              </div>
            )),
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
