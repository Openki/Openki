import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import * as Metatags from "/imports/utils/metatags";

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

export function DashboardPage() {
  const { t } = useTranslation();
  const [recentActivitiesCoursesIsLoading, recentActivitiesCourses] = Courses.useFindFilter();

  const filter = CourseCollection.Filtering();
  const urlParams = new URLSearchParams("needsRole=mentor");
  const params = Object.fromEntries(urlParams);
  filter.read(params);
  const query = filter.done().toQuery();

  const [lookingForMentorsIsLoading, lookingForMentorsCourses] = Courses.useFindFilter(query);

  useEffect(() => {
    Metatags.setCommonTags(t("dashboard.title", "Dashboard"));
  });

  return (
    <>
      {!recentActivitiesCoursesIsLoading() ? (
        <div className="container mb-4">
          <h2>{t("explore.recentActivities.title", "Recent activities")}</h2>
          <div className="d-flex flex-row flex-nowrap pb-2 overflow-x-scroll">
            {recentActivitiesCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      ) : null}
      {!lookingForMentorsIsLoading() ? (
        <div className="container mb-4">
          <h2>{t("explore.lookingForMentors.title", "Looking for mentors")}</h2>
          <div className="d-flex flex-row flex-nowrap pb-2 overflow-x-scroll">
            {lookingForMentorsCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("DashboardPage", () => DashboardPage);
