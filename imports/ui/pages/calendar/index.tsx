import React, { useEffect, useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useCurrentRegion } from "/imports/ui/hooks/useCurrentRegion";

import { Events } from "/imports/api/events/events";
import { useFindFilter } from "/imports/api/events/publications";

import { MetaTags } from "/imports/ui/components/MetaTags";

import { LoadingPage } from "../loading";
import { Day } from "./day";
import { Multi } from "../../components/calendar-nav/multi";

import "./styles.scss";

export function CalendarPage(props: Record<string, string>) {
  const { t } = useTranslation();
  const [isAttendeeFilterOn, setIsAttendeeFilterOn] = useState(false);

  const region = useCurrentRegion();

  const filter = Events.Filtering();
  // Read URL state
  const date = region?.calendarStartDate || new Date();
  filter.set("start", moment(date).startOf("week")).read(props);
  // Show internal events only when a organization or venue is specified
  if (!props.organization && !props.venue && props.internal === undefined) {
    filter.disable("internal");
  }
  filter.set("region", region?._id || "all");

  const filterQuery = filter.toQuery();

  const startMoment = filter.get("start") as moment.Moment;
  const after = startMoment.toDate();
  const end = startMoment.add(1, "week").toDate();

  filterQuery.after = after;
  filterQuery.end = end;
  const [isLoading, events] = useFindFilter(filterQuery);

  function days() {
    const start = filter.get("start");
    const ds = [];
    for (let i = 0; i < 7; i += 1) {
      ds.push({
        date: moment(start).add(i, "days"),
        events: events.filter(
          (e) =>
            moment(e.start) > moment(start).add(i, "days") &&
            moment(e.start) <= moment(start).add(i + 1, "days"),
        ),
      });
    }

    return ds;
  }
  function startDate() {
    return moment(filter.get("start"));
  }

  useEffect(() => {
    // only do this in the current week
    if (moment().format("w") === filter.get("start")?.format("w")) {
      if (!isLoading()) {
        const elem = $(".js-calendar-date").eq(moment().weekday());

        // calendar nav and topnav are together 137px fixed height, we add 3px margin
        window.scrollTo(0, (elem.offset() || { top: 0 }).top - 140);
      }
    }
  });

  return (
    <>
      <MetaTags title={t("calendar.windowtitle", "Calendar")} />

      <Multi
        date={startDate()}
        filter={filter}
        isAttendeeFilterOn={isAttendeeFilterOn}
        setIsAttendeeFilterOn={(newValue) => {
          setIsAttendeeFilterOn(newValue);
        }}
      />
      <div className="container calendar-container">
        <div className="page-component mt-4">
          {!isLoading() ? (
            days().map((day) => (
              <React.Fragment key={day.date.toISOString()}>
                <Day date={day.date} events={day.events} isAttendeeFilterOn={isAttendeeFilterOn} />
                <hr />
              </React.Fragment>
            ))
          ) : (
            <LoadingPage />
          )}
        </div>
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("CalendarPage", () => CalendarPage);
