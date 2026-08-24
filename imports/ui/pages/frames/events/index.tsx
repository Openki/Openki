import React, { useState } from "react";
import { take } from "lodash-es";
import { Router } from "meteor/iron:router";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useUserId } from "/imports/utils/react-meteor-data";

import { Events } from "/imports/api/events/events";
import { useFindFilter } from "/imports/api/events/publications";

import { Filtering } from "/imports/utils/filtering";
import { MetaTags } from "/imports/ui/components/MetaTags";
import * as Predicates from "/imports/utils/predicates";
import { useCurrentRouteName } from "/imports/utils/react-meteor-router";
import { useReactiveNow } from "/imports/utils/reactive-now";
import * as UrlTools from "/imports/utils/url-tools";

import { Props as CalendarNavData, Day } from "/imports/ui/components/calendar-nav/day";
import { EventList } from "/imports/ui/components/events/list";

import "./styles.scss";

const DefaultLimit = 6;

export function EventsPage(data: Record<string, string>) {
  const { t } = useTranslation();

  const reactiveNow = useReactiveNow();

  const [isAttendeeFilterOn, setIsAttendeeFilterOn] = useState(false);

  const filter = Events.Filtering().read(data);

  const date = (filter.get("after") || moment(reactiveNow)).startOf("day");

  const filterQuery = filter.toQuery();

  const userId = useUserId();
  // filter isAttendeeFilterOn in addition to filtering that get's passed in via url
  if (userId && isAttendeeFilterOn) {
    filterQuery.participant = userId;
  }

  filterQuery.after = date.toDate();

  // by default internal and not internal are show
  // in this view we want only show internal if a organization is set
  if (!filterQuery.organization && !filterQuery.organizations?.length) {
    filterQuery.internal = filterQuery.internal || false;
  }

  const limit =
    new Filtering({
      count: Predicates.integer,
    })
      .read(data)
      .toQuery().count || DefaultLimit;

  const [isLoading, events] = useFindFilter(filterQuery, limit + 1);

  const routerName = useCurrentRouteName();

  const update = () => {
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
    if (data.filterOrganizations) {
      filterParams.filterOrganizations = data.filterOrganizations;
    } else {
      delete filterParams.filterOrganizations;
    }
    delete filterParams.region; // HACK region is kept in the session (for bad reasons)
    const queryString = UrlTools.paramsToQueryString(filterParams);

    const options: { query?: string } = {};
    if (queryString.length) {
      options.query = queryString;
    }

    Router.go(routerName, {}, options);
  };

  function control() {
    return data.control === "1";
  }
  function calendarNavAttr(): CalendarNavData {
    return {
      hideSwitches: data.hideSwitches === "1",
      search: filter.get("search") ?? "",
      onChangeSearch: (newValue: string) => {
        filter.add("search", newValue);
        update();
      },
      date,
      onChangeDate: (newDate) => {
        filter.add("after", newDate.startOf("day").toISOString());
        update();
      },
      availableOrganizations:
        new Filtering({
          filterOrganizations: Predicates.ids,
        })
          .read(data)
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
      isAttendeeFilterOn,
      onChangeAttendingEventsOnly: (state) => {
        setIsAttendeeFilterOn(state);
      },
    };
  }

  if (isLoading()) {
    return null;
  }

  return (
    <>
      <MetaTags title={t("event.list.windowtitle", "Events")} />

      {control() && <Day {...calendarNavAttr()} />}
      <div className="frame-events">
        <EventList dataEvents={take(events, limit)} withDate withImage openInNewTab />
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FrameEventsPage", () => EventsPage);
