import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import * as Metatags from "/imports/utils/metatags";

// import { CourseList } from "../../components/courses/list";
import * as Courses from "/imports/api/courses/publications";

export function DashboardPage() {
  const { t } = useTranslation();
  const [isLoading, courses] = Courses.useFindFilter();

  useEffect(() => {
    Metatags.setCommonTags(t("dashboard.title", "Dashboard"));
  });

  if (isLoading()) {
    return null;
  }
  return (
    <div className="container">
      <h2>Bootstrap 5 Horizontal Scrolling Cards with Flexbox</h2>
      <div className="d-flex flex-row flex-nowrap pb-2 overflow-x-scroll">
        <div className="card text-bg-primary mb-3">
          <div className="card-body">
            <h5 className="card-title">Primary card title</h5>
            <p className="card-text">
              Some quick example text to build on the card title and make up the bulk of the card's
              content.
            </p>
          </div>
        </div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
        <div className="card card-body">Card</div>
      </div>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("DashboardPage", () => DashboardPage);
