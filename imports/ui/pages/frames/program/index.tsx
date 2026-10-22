import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/ui/hooks/useDateTimeFormat";
import { useUserId } from "/imports/ui/hooks/react-meteor-data";
import { useCurrentRouteName } from "/imports/ui/hooks/react-meteor-router";
import moment from "moment";

import { Events, FindParams } from "/imports/api/events/events";

import { reactiveNow } from "/imports/utils/reactive-now";
import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import { useViewportSize } from "/imports/ui/hooks/useViewportSize";
import { ScssVars } from "/imports/ui/lib/scss-vars";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { ComponentSettings, Dashboard } from "/imports/ui/components/dashboard";
import { AccountTasks } from "/imports/ui/components/account-tasks";
import {
  CalendarNavProgram,
  Props as CalendarNavData,
} from "/imports/ui/components/calendar-nav/program";

function getDays(start: moment.Moment, end: moment.Moment) {
  const days = [];
  let current = moment(start);
  while (current.isBefore(end)) {
    const next = moment(current).add(1, "day");
    days.push(current);
    current = next;
  }
  return days;
}

export function ProgramPage(props: Record<string, string>) {
  const { t } = useTranslation();
  const { dayOfWeekAndMonthShort, dayOfWeekAndMonthLong } = useDateTimeFormat();
  const userId = useUserId();
  const [isAttendeeFilterOn, setIsAttendeeFilterOn] = useState(false);

  const viewport = useViewportSize();
  const isMobileScreen = viewport.width <= ScssVars.screenXS;

  const filter = new Filtering({
    ...FindParams,
    count: Predicates.integer,
    control: Predicates.flag,
    hideSwitches: Predicates.flag,
    hideCategories: Predicates.flag,
    filterOrganizations: Predicates.ids,
  }).read(props);

  const date = moment(reactiveNow.get());
  const start = filter.get("start") || moment(date).startOf("week");
  const end = filter.get("end") || moment(start).add(1, "week");

  function calcSelectedDays() {
    const days = getDays(start, end);
    if (date.isSameOrBefore(end)) {
      // auto hide days that are passed
      return days.filter((d) => !d.isBefore(date, "day"));
    }
    // if all passed show all days as default
    return days;
  }

  const [selectedDays, setSelectedDays] = useState(calcSelectedDays());

  function calendarNavAttr(): CalendarNavData {
    return {
      hideSwitches: filter.get("hideSwitches") ?? false,
      hideCategories: filter.get("hideCategories") ?? false,
      search: filter.get("search") ?? "",
      onChangeSearch: (newValue: string) => {
        filter.set("search", newValue);
        update();
      },
      days: getDays(start, end),
      selectedDays,
      onAddDay: (day) => {
        setSelectedDays((selectedDays) => [...selectedDays, day].toSorted());
      },
      onRemoveDay: (day) => {
        setSelectedDays((selectedDays) => selectedDays.filter((d) => !d.isSame(day)));
      },
      availableOrganizations: filter.get("filterOrganizations") ?? [],
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

  function days() {
    const days = [];
    let current = moment(start);
    while (current.isBefore(end)) {
      const next = moment(current).add(1, "day");

      days.push(current);
      current = next;
    }
    return days;
  }

  const routeName = useCurrentRouteName();

  function update() {
    const query = filter.toParams();

    delete query.region; // HACK region is kept in the session (for bad reasons)

    Router.go(routeName, {}, { query });
  }

  return (
    <>
      <MetaTags title={t("calendar.windowtitle", "Calendar")} />

      <AccountTasks />
      {Boolean(filter.get("control")) && <CalendarNavProgram {...calendarNavAttr()} />}
      <div className="py-4">
        <Dashboard
          list={
            days()
              .filter((day) => selectedDays.find((s) => s.isSame(day)))
              .flatMap((day) => {
                let afternoon;
                {
                  const filter = Events.Filtering().read(props);

                  filter.set("after", day);
                  filter.set("end", moment(day).add(17.75, "hour"));

                  // filter isAttendeeFilterOn in addition to filtering that get's passed in via url
                  if (userId && isAttendeeFilterOn) {
                    filter.set("participant", userId);
                  }
                  afternoon = {
                    title: t("program.morningAfternoon", "{DAYOFWEEK}, morning & afternoon", {
                      DAYOFWEEK: isMobileScreen
                        ? dayOfWeekAndMonthShort(day)
                        : dayOfWeekAndMonthLong(day),
                    }),
                    entity:
                      props.hideCategories !== "1" ? "eventModern" : "eventModernWithoutCategories",
                    query: new URLSearchParams(filter.toParams()).toString(),
                  };
                }
                let evening;
                {
                  const filter = Events.Filtering().read(props);

                  filter.set("after", moment(day).add(17.75, "hour"));
                  filter.set("end", moment(day).add(1, "day"));

                  // filter isAttendeeFilterOn in addition to filtering that get's passed in via url
                  if (userId && isAttendeeFilterOn) {
                    filter.set("participant", userId);
                  }
                  evening = {
                    title: t("program.evening", "{DAYOFWEEK}, evening", {
                      DAYOFWEEK: isMobileScreen
                        ? dayOfWeekAndMonthShort(day)
                        : dayOfWeekAndMonthLong(day),
                    }),
                    entity:
                      props.hideCategories !== "1" ? "eventModern" : "eventModernWithoutCategories",
                    query: new URLSearchParams(filter.toParams()).toString(),
                  };
                }

                return [afternoon, evening];
              }) as ComponentSettings[]
          }
          limit={filter.get("count") || 10}
          fluid
        />
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FrameProgramPage", () => ProgramPage);
