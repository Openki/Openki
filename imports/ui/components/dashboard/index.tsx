import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { Courses as CourseCollection, CourseModel } from "/imports/api/courses/courses";
import { Events as EventCollection, EventModel } from "/imports/api/events/events";
import { Groups as GroupCollection, GroupModel } from "/imports/api/groups/groups";
import * as Courses from "/imports/api/courses/publications";
import * as Events from "/imports/api/events/publications";
import * as Groups from "/imports/api/groups/publications";

import { Filtering } from "/imports/utils/filtering";
import { SortSpec } from "/imports/utils/sort-spec";
import { Publication } from "/imports/utils/ServerPublishReact";

import { CourseCompact } from "../../components/courses/compact";
import { EventCompact } from "../../components/events/compact";
import { EventsMap } from "../../components/events/map";

import "./styles.scss";

function bodyStyle(imageUrl: string) {
  const src = imageUrl;
  if (!src) {
    return {};
  }

  return {
    backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}')`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
}

const mapping: {
  [name: string]:
    | {
        route: string;
        filter: () => Filtering<any>;
        find: Publication<any, any>;
        element: (entity: any) => React.JSX.Element;
      }
    | {
        route: string;
        filter: () => Filtering<any>;
        find: Publication<any, any>;
        component: (entitys: any) => React.JSX.Element;
      };
} = {
  course: {
    route: "home",
    filter: CourseCollection.Filtering,
    find: Courses.useFindFilter,
    element: (course: CourseModel) => (
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
    element: (event: EventModel) => (
      <div key={event._id} className="me-2" style={{ inlineSize: "250px", minInlineSize: "250px" }}>
        <EventCompact event={event} withDate={true} withImage={true} />
      </div>
    ),
  },
  group: {
    route: "exploreGroups",
    filter: GroupCollection.Filtering,
    find: Groups.useFindFilter,
    element: (group: GroupModel) => (
      <div key={group._id} className="me-2">
        <div
          className="card card-group border-0 rounded-0"
          style={bodyStyle(group.publicLogoUrl())}
        >
          <div className="card-body">
            <h5 className="card-title">
              <a className="stretched-link" href={Router.path("groupDetails", group)}>
                {group.name}
              </a>
            </h5>
            <p className="card-text">{group.claim}</p>
          </div>
        </div>
      </div>
    ),
  },
  eventsMap: {
    route: "eventsMap",
    filter: EventCollection.Filtering,
    find: Events.useFindFilter,
    component: (all: any) => (
      <div style={{ height: "440px" }}>
        <EventsMap events={all} openLinksInNewTab={false} />
      </div>
    ),
  },
};

export function Dashboard({
  list,
}: {
  list: {
    entity: string;
    title: string;
    query: string;
    showAll?: string;
  }[];
}) {
  const { t } = useTranslation();

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
    return {
      isLoading,
      data,
      route: handler.route,
      element: (handler as any).element,
      component: (handler as any).component,
      ...i,
    };
  });

  return (
    <>
      {hooks.map((h, i) => (
        <React.Fragment key={i}>
          {!h.isLoading() && h.data.length > 0 ? (
            <div className="container mb-4">
              <a
                className="btn btn-sm btn-success float-end"
                href={h.showAll || Router.path(h.route, undefined, { query: h.query })}
              >
                {t("dashboard.showAll", "Show all >")}
              </a>
              <h2>{h.title}</h2>
              {h.element ? (
                <div className="d-flex flex-row flex-nowrap pb-3 overflow-x-scroll">
                  {h.data.map(h.element)}
                </div>
              ) : (
                h.component?.(h.data)
              )}
            </div>
          ) : null}
        </React.Fragment>
      ))}
    </>
  );
}
