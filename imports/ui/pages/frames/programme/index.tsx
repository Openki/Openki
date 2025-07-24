import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useUserId } from "/imports/utils/react-meteor-data";

import moment from "moment";

import { Events } from "/imports/api/events/events";

import * as UrlTools from "/imports/utils/url-tools";
import { reactiveNow } from "/imports/utils/reactive-now";
import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import * as Metatags from "/imports/utils/metatags";

import { Dashboard } from "/imports/ui/components/dashboard";
import { AccountTasks } from "/imports/ui/components/account-tasks";
import {
  CalendarNavProgramme,
  Props as CalendarNavData,
} from "/imports/ui/components/calendar-nav/programme";

import "./template.html";
import "./styles.scss";

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

export function ProgrammePage(data: Record<string, string>) {
  const { t } = useTranslation();
  const { calendarDayFormat } = useDateTimeFormat();
  const userId = useUserId();
  const [isAttendeeFilterOn, setIsAttendeeFilterOn] = useState(false);

  const filter = Events.Filtering().read(data);

  const date = moment(reactiveNow.get());
  const start = filter.get("start") || date.startOf("week");
  const end = filter.get("end") || moment(start).add(1, "week");

  const [selectedDays, setSelectedDays] = useState(getDays(start, end));

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
      days: getDays(start, end),
      selectedDays,
      onAddDay: (day) => {
        setSelectedDays([...selectedDays, day].sort());
      },
      onRemoveDay: (day) => {
        setSelectedDays(selectedDays.filter((d) => !d.isSame(day)));
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

  useEffect(() => {
    Metatags.setCommonTags(t("calendar.windowtitle", "Calendar"));
  });

  function update() {
    const filterParams = filter.toParams() as Record<string, string>;
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
      {control() && <CalendarNavProgramme {...calendarNavAttr()} />}
      <div className="py-4">
        <Dashboard
          list={days()
            .filter((day) => selectedDays.find((s) => s.isSame(day)))
            .map((day) => {
              const f = Events.Filtering().read(data);

              f.add("after", day);
              f.add("end", moment(day).add(1, "day"));

              // filter isAttendeeFilterOn in addition to filtering that get's passed in via url
              if (userId && isAttendeeFilterOn) {
                f.add("participant", userId);
              }
              return {
                title: calendarDayFormat(day),
                entity: "eventModern",
                showAll: false,
                query: UrlTools.paramsToQueryString(f.toParams()),
              };
            })}
        />
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FrameProgrammePage", () => ProgrammePage);
