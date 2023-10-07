import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import * as Metatags from "/imports/utils/metatags";
import { Filtering } from "/imports/utils/filtering";
import { Publication } from "/imports/utils/ServerPublishReact";

import { Courses as CourseCollection, CourseModel } from "/imports/api/courses/courses";
import * as Courses from "/imports/api/courses/publications";

import "./styles.scss";

export function CourseCard(props: { course: CourseModel }) {
  const { course } = props;
  return (
    <div className="card card-course me-1">
      <div className="card-body">
        <h5 className="card-title">
          <a className="stretched-link" href={Router.path("showCourse", course)}>
            {course.name}
          </a>
        </h5>
        <p className="card-text">{course.description}</p>
      </div>
    </div>
  );
}

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
    component: (course: CourseModel) => <CourseCard key={course._id} course={course} />,
  },
};

export function DashboardPage() {
  const { t } = useTranslation();

  const list = [
    {
      entity: "course",
      title: t("explore.recentActivities.title", "Recent activities"),
      query: "",
    },
    {
      entity: "course",
      title: t("explore.lookingForMentors.title", "Looking for mentors"),
      query: "needsRole=mentor",
    },
    {
      entity: "course",
      title: t("explore.lookingForVenues.title", "Looking for venues"),
      query: "needsRole=venues",
    },
  ];

  const hooks = list.map((i) => {
    const handler = mapping[i.entity];

    const filter = handler.filter();
    const urlParams = new URLSearchParams(i.query);
    const params = Object.fromEntries(urlParams);
    filter.read(params);
    const query = filter.done().toQuery();
    const [isLoading, data] = handler.find(query);
    return { isLoading, data, route: handler.route, component: handler.component, ...i };
  });

  useEffect(() => {
    Metatags.setCommonTags(t("dashboard.title", "Dashboard"));
  });

  return hooks.map((h, i) => (
    <React.Fragment key={i}>
      {!h.isLoading() ? (
        <div className="container mb-4">
          <a className="float-end" href={Router.path(h.route, undefined, { query: h.query })}>
            {t("dashboard.more", "More")}
          </a>
          <h2>{h.title}</h2>
          <div className="d-flex flex-row flex-nowrap pb-2 overflow-x-scroll">
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
