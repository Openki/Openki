import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { Courses as CourseCollection, CourseModel } from "/imports/api/courses/courses";
import * as Courses from "/imports/api/courses/publications";

import * as Metatags from "/imports/utils/metatags";
import { Filtering } from "/imports/utils/filtering";
import { SortSpec } from "/imports/utils/sort-spec";
import { Publication } from "/imports/utils/ServerPublishReact";

import "./styles.scss";

export function CourseCard(props: { course: CourseModel }) {
  const { course } = props;

  function courseCss() {
    if (!course.nextEvent) {
      return {};
    }

    const src = course?.publicImageUrl();
    if (!src) {
      return {};
    }

    return {
      backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}')`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    };
  }

  function courseStateClasses() {
    const classes = [];

    if (course.nextEvent) {
      classes.push("has-upcoming-events");
    } else if (course.lastEvent) {
      classes.push("has-past-events");
    } else {
      classes.push("is-proposal");
    }

    if (course.archived) {
      classes.push("is-archived");
    }

    return classes.join(" ");
  }

  return (
    <div className={`card card-course ${courseStateClasses()} me-1`} style={courseCss()}>
      <div className="card-body">
        <h5 className="card-title">
          <a className="stretched-link" href={Router.path("showCourse", course)}>
            {course.name}
          </a>
        </h5>
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
      title: t("explore.newProposals.title", "New proposals"),
      query: "state=proposal&sort=time_created",
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

    const sortParam = params.sort;
    const sort = sortParam ? SortSpec.fromString(sortParam) : SortSpec.unordered();

    const [isLoading, data] = handler.find(query, 30, 0, sort.spec());
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
