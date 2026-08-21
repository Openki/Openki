import React, { useMemo, useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useCurrentRouteName } from "/imports/utils/react-meteor-router";

import moment from "moment";

import { Events, FindParams } from "/imports/api/events/events";

import * as UrlTools from "/imports/utils/url-tools";
import { reactiveNow } from "/imports/utils/reactive-now";
import { Filtering, useFiltering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
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

export function ProgramPage(data: Record<string, string>) {
  const { t } = useTranslation();
  const { dayOfWeekAndMonthShort, dayOfWeekAndMonthLong } = useDateTimeFormat();
  const userId = useUserId();
  const [isAttendeeFilterOn, setIsAttendeeFilterOn] = useState(false);

  const viewport = useViewportSize();
  const isMobileScreen = viewport.width <= ScssVars.screenXS;

  const predicates = useMemo(
    () => ({
      ...FindParams,
      count: Predicates.integer,
      control: Predicates.flag,
      hideSwitches: Predicates.flag,
      hideCategories: Predicates.flag,
      filterOrganizations: Predicates.ids,
    }),
    [],
  );
  const filter = useFiltering(predicates, data);

  const date = moment(reactiveNow.get());
  const start = moment(filter.asQuery["start"]) || moment(date).startOf("week");
  const end = moment(filter.asQuery["end"]) || moment(start).add(1, "week");

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
      hideSwitches: filter.asQuery["hideSwitches"],
      hideCategories: filter.asQuery["hideCategories"],
      search: filter.asQuery["search"],
      onChangeSearch: (newValue: string) => {
        navigateWithFilter((filter) => filter.add("search", newValue));
      },
      days: getDays(start, end),
      selectedDays,
      onAddDay: (day) => {
        setSelectedDays((selectedDays) => [...selectedDays, day].sort());
      },
      onRemoveDay: (day) => {
        setSelectedDays((selectedDays) => selectedDays.filter((d) => !d.isSame(day)));
      },
      availableOrganizations: filter.asQuery["filterOrganizations"],
      selectedOrganizations: filter.asQuery["organizations"],
      onChangeOrganizations: (organizations) => {
        navigateWithFilter((filter) => filter.set("organizations", organizations));
      },
      categories: filter.asQuery["categories"],
      onChangeCategories: (categories) => {
        navigateWithFilter((filter) => filter.set("categories", categories));
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

  function navigateWithFilter(change: (filter: Filtering<typeof predicates>) => void) {
    const next = filter.update(change);

    const params = next.toParams() as Record<string, string>;

    delete params.region; // HACK region is kept in the session (for bad reasons)

    const query = UrlTools.paramsToQueryString(params);

    Router.go(routeName, {}, query ? { query } : {});
  }

  return (
    <>
      <MetaTags title={t("calendar.windowtitle", "Calendar")} />

      <AccountTasks />
      {!!filter.asQuery["control"] && <CalendarNavProgram {...calendarNavAttr()} />}
      <div className="py-4">
        <Dashboard
          list={
            days()
              .filter((day) => selectedDays.find((s) => s.isSame(day)))
              .flatMap((day) => {
                let afternoon;
                {
                  const f = Events.Filtering().read(data);

                  f.add("after", day);
                  f.add("end", moment(day).add(17.75, "hour"));

                  // filter isAttendeeFilterOn in addition to filtering that get's passed in via url
                  if (userId && isAttendeeFilterOn) {
                    f.add("participant", userId);
                  }
                  afternoon = {
                    title: t("program.morningAfternoon", "{DAYOFWEEK}, morning & afternoon", {
                      DAYOFWEEK: isMobileScreen
                        ? dayOfWeekAndMonthShort(day)
                        : dayOfWeekAndMonthLong(day),
                    }),
                    entity:
                      data.hideCategories !== "1" ? "eventModern" : "eventModernWithoutCategories",
                    query: UrlTools.paramsToQueryString(f.toParams()),
                  };
                }
                let evening;
                {
                  const f = Events.Filtering().read(data);

                  f.add("after", moment(day).add(17.75, "hour"));
                  f.add("end", moment(day).add(1, "day"));

                  // filter isAttendeeFilterOn in addition to filtering that get's passed in via url
                  if (userId && isAttendeeFilterOn) {
                    f.add("participant", userId);
                  }
                  evening = {
                    title: t("program.evening", "{DAYOFWEEK}, evening", {
                      DAYOFWEEK: isMobileScreen
                        ? dayOfWeekAndMonthShort(day)
                        : dayOfWeekAndMonthLong(day),
                    }),
                    entity:
                      data.hideCategories !== "1" ? "eventModern" : "eventModernWithoutCategories",
                    query: UrlTools.paramsToQueryString(f.toParams()),
                  };
                }

                return [afternoon, evening];
              }) as ComponentSettings[]
          }
          limit={filter.asQuery["count"] || 10}
          fluid
        />
      </div>
    </>
  );
}

// for Blaze

import "./template.html";
import { useViewportSize } from "/imports/ui/lib/useViewportSize";
import { ScssVars } from "/imports/ui/lib/scss-vars";

Template.registerHelper("FrameProgramPage", () => ProgramPage);
