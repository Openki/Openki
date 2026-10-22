import React, { useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "/imports/ui/hooks/react-meteor-router";
import { MetaTags } from "/imports/ui/components/MetaTags";
import { chain } from "lodash-es";
import { useSession } from "/imports/ui/hooks/react-meteor-data";
import { useReactiveNow } from "/imports/utils/reactive-now";

import { useFindFilter } from "/imports/api/events/publications";
import { Events } from "/imports/api/events/events";

import { LoadingRow } from "../../loading";
import { Event } from "./event";
import { CssFromQuery } from "/imports/ui/lib/css-from-query";

function useOptions() {
  const query = useSearchParams();
  const now = useReactiveNow();

  let startDate = moment(now);
  if (query.start) {
    startDate = moment(query.start);
  }
  let endDate: moment.Moment | undefined;
  if (query.end) {
    endDate = moment(query.end).add(1, "day");
  }

  const filter = Events.Filtering().read(query);
  if (startDate.isValid()) {
    if (query.ongoing !== "0") {
      filter.set("start", startDate);
    } else {
      filter.set("after", startDate);
    }
  }
  if (endDate && endDate.isValid()) {
    filter.set("end", endDate);
  }

  const filterQuery = filter.toQuery();

  // Show internal events only when a organization or venue is specified
  if (!filterQuery.organization && !filterQuery.venue && filterQuery.internal === undefined) {
    filterQuery.internal = false;
  }

  const count = Number.parseInt(query.count || "", 10) || 200;

  const hideRsvp = !!Number.parseInt(query.hideRsvp || "", 10) || false;

  const style = new CssFromQuery(query, [
    ["itembg", "background-color", ".frame-list-item-event"],
    ["itemcolor", "color", ".frame-list-item-event"],
    ["linkcolor", "color", ".frame-list-item-event a"],
    ["regionbg", "background-color", ".frame-list-item-region"],
    ["regioncolor", "color", ".frame-list-item-region"],
    ["itemfontweight", "font-weight", ".frame-list-item-header"],
  ]).getCssRules();

  return {
    filter: filterQuery,
    count,
    hideRsvp,
    style,
  };
}

export function CalendarPage() {
  const { t } = useTranslation();
  const options = useOptions();
  const [limit, setLimit] = useState(options.count);
  const timeLocale = useSession("timeLocale") || "en";

  const [isLoading, events] = useFindFilter(options.filter, limit + 1, undefined, [
    ["start", "asc"],
  ]);

  const groupedEvents = chain(events)
    .take(limit)
    .groupBy((event) => moment(event.start).locale(timeLocale).format("LL"))
    .value();

  function days() {
    return Object.keys(groupedEvents);
  }
  function eventsOn(day: string) {
    return groupedEvents[day];
  }
  function moreEvents() {
    return events.length > limit;
  }

  return (
    <>
      <MetaTags title={t("calendar.windowtitle", "Calendar")} />
      <style>{options.style}</style>

      {days().map((day) => (
        <React.Fragment key={day}>
          <h4 className="frame-list-title">{day}</h4>
          {eventsOn(day).map((event) => (
            <Event key={event._id} event={event} hideRsvp={options.hideRsvp} />
          ))}
        </React.Fragment>
      ))}
      {!isLoading() ? (
        <>
          {!days().length && (
            <h2 className="mt-5 text-center">
              {t("frame.calendar.noEvents", "No events planned")}
            </h2>
          )}
          {moreEvents() && (
            <div className="mt-2 text-center">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setLimit(limit + 10);
                }}
              >
                {t("_button.more")}
              </button>
            </div>
          )}
        </>
      ) : (
        <LoadingRow />
      )}
    </>
  );
}

// for Blaze
import "./template.html";
Template.registerHelper("FrameCalendarPage", () => CalendarPage);
