import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { CourseModel } from "/imports/api/courses/courses";

export type Props = {
  course: CourseModel;
};

export function Add({ course }: Props) {
  const { t } = useTranslation();

  return (
    <div className="event-caption-wrap" id="add-event">
      <a
        className="btn p-0"
        href={Router.path("createEvent", undefined, { query: { courseId: course._id } })}
        title={t("course.event.edit.add")}
      >
        <div className="event-caption event-caption-placeholder event-caption-action event-caption-add">
          <div className="event-caption-header-wrap">
            <div className="event-caption-header">
              <div className="event-caption-pseudoborder"></div>
            </div>
          </div>
          <div className="event-caption-body-wrap">
            <div className="event-caption-body"></div>
          </div>
          <span className="event-caption-icon">
            <i className="fa-solid fa-plus fa-2x"></i>
          </span>
        </div>
      </a>
    </div>
  );
}
