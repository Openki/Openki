import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { Courses as CourseCollection, CourseModel } from "/imports/api/courses/courses";
import { Events as EventCollection, EventModel } from "/imports/api/events/events";
import * as Courses from "/imports/api/courses/publications";
import * as Events from "/imports/api/events/publications";

import * as Metatags from "/imports/utils/metatags";
import { Filtering } from "/imports/utils/filtering";
import { SortSpec } from "/imports/utils/sort-spec";
import { Publication } from "/imports/utils/ServerPublishReact";

import { CourseCompact } from "../../components/courses/compact";
import { EventCompact } from "../../components/events/compact";

const mapping: {
  [name: string]: {
    route: string;
    filter: () => Filtering<any>;
    find: Publication<any, any>;
    component: (entity: any) => React.JSX.Element;
  };
} = {
  course: {
    route: "home",
    filter: CourseCollection.Filtering,
    find: Courses.useFindFilter,
    component: (course: CourseModel) => (
      <div
        key={course._id}
        className="me-2"
        style={{ inlineSize: "300px", minInlineSize: "300px" }}
      >
        <CourseCompact course={course} />
      </div>
    ),
  },
  event: {
    route: "calendar",
    filter: EventCollection.Filtering,
    find: Events.useFindFilter,
    component: (event: EventModel) => (
      <div key={event._id} className="me-2" style={{ inlineSize: "250px", minInlineSize: "250px" }}>
        <EventCompact event={event} withDate={true} withImage={true} />
      </div>
    ),
  },
};

export function DashboardPage() {
  const { t } = useTranslation();

  const list = [
    {
      entity: "course",
      title: t("explore.recentActivities.title", "Recent activities"),
      query: "internal=0",
    },
    {
      entity: "event",
      title: t("explore.upcomingEvents.title", "Upcoming events"),
      query: "after=now&sort=start&internal=0&canceled=0",
    },
    {
      entity: "course",
      title: t("explore.newProposals.title", "New proposals"),
      query: "state=proposal&sort=time_created&internal=0",
    },
    {
      entity: "course",
      title: t("explore.lookingForMentors.title", "Looking for mentors"),
      query: "needsRole=mentor&internal=0",
    },
    {
      entity: "course",
      title: t("explore.lookingForVenues.title", "Looking for venues"),
      query: "needsRole=venues&internal=0",
    },
  ];

  const hooks = list.map((i) => {
    const handler = mapping[i.entity];

    const filter = handler.filter();
    const urlParams = new URLSearchParams(i.query);
    const params = Object.fromEntries(urlParams);
    filter.read(params);
    const query = filter.done().toQuery();

    const sortParam = params.sort;
    const sort = sortParam ? SortSpec.fromString(sortParam) : SortSpec.unordered();

    const [isLoading, data] = handler.find(query, 10, 0, sort.spec());
    return { isLoading, data, route: handler.route, component: handler.component, ...i };
  });

  useEffect(() => {
    Metatags.setCommonTags(t("dashboard.title", "Dashboard"));
  });

  return hooks.map((h, i) => (
    <React.Fragment key={i}>
      {!h.isLoading() ? (
        <div className="container mb-4">
          <a
            className="btn btn-sm btn-success float-end"
            href={Router.path(h.route, undefined, { query: h.query })}
          >
            {t("dashboard.showAll", "Show all >")}
          </a>
          <h2>{h.title}</h2>
          <div className="d-flex flex-row flex-nowrap pb-3 overflow-x-scroll">
            {h.data.map(h.component)}
          </div>
        </div>
      ) : null}
    </React.Fragment>
  ));
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("DashboardPage", () => DashboardPage);
