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

import { Props as CalendarNavData, Day } from "/imports/ui/components/calendar-nav/day";
import { EventList } from "/imports/ui/components/events/list";

import "./styles.scss";

const DefaultLimit = 6;

export function EventsPage(props: Record<string, string>) {
  const { t } = useTranslation();

  const reactiveNow = useReactiveNow();

  const [isAttendeeFilterOn, setIsAttendeeFilterOn] = useState(false);

  const filter = Events.Filtering().read(props);

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
      .read(props)
      .toQuery().count || DefaultLimit;

  const [isLoading, events] = useFindFilter(filterQuery, limit + 1);

  const routerName = useCurrentRouteName();

  const update = () => {
    const query: Record<string, string> = filter.toParams();
    query.count = limit.toString();
    if (props.control) {
      query.control = props.control;
    } else {
      delete query.control;
    }
    if (props.hideSwitches) {
      query.hideSwitches = props.hideSwitches;
    } else {
      delete query.hideSwitches;
    }
    if (props.filterOrganizations) {
      query.filterOrganizations = props.filterOrganizations;
    } else {
      delete query.filterOrganizations;
    }
    delete query.region; // HACK region is kept in the session (for bad reasons)

    Router.go(routerName, {}, { query });
  };

  function control() {
    return props.control === "1";
  }
  function calendarNavAttr(): CalendarNavData {
    return {
      hideSwitches: props.hideSwitches === "1",
      search: filter.get("search") ?? "",
      onChangeSearch: (newValue: string) => {
        filter.set("search", newValue);
        update();
      },
      date,
      onChangeDate: (newDate) => {
        filter.set("after", newDate.startOf("day"));
        update();
      },
      availableOrganizations:
        new Filtering({
          filterOrganizations: Predicates.ids,
        })
          .read(props)
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
