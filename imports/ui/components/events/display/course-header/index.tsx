import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { Template } from "meteor/templating";
import React from "react";

import { CourseModel } from "/imports/api/courses/courses";

import { CourseCategories } from "/imports/ui/components/courses/categories";
import { RegionTag } from "/imports/ui/components/regions/tag";
import { GroupList } from "/imports/ui/components/courses/display/group-list";

import "./styles.scss";

export type Props = {
  course?: CourseModel;
  backlink?: string;
  headerlink?: string;
  regionId: string;
  categories: string[];
  groups?: string[];
  title: string;
  image: string;
};

export function EventCourseHeader(props: Props) {
  const { t } = useTranslation();
  return (
    <div
      className={`event-course-header${props.headerlink ? " event-course-header-link" : ""}`}
      onClick={() => {
        if (props.headerlink) {
          Router.go(props.headerlink);
        }
      }}
      style={
        props.image
          ? {
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${props.image}')`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      {!!props.backlink && (
        <>
          <a
            className="back-to-course-overview"
            href={props.backlink}
            title={t("event.details.viewCourse")}
          >
            <i className="fa-solid fa-angle-left fa-fw" aria-hidden="true"></i>
          </a>
          <a href={props.backlink}>
            <i className="fa-solid fa-angle-left fa-fw" aria-hidden="true"></i>
            {t("event.details.viewCourse", "To the course overview")}
          </a>
        </>
      )}
      <h2>{props.title}</h2>
      <CourseCategories categories={props.categories} />
      {!!props.course && <GroupList course={props.course} />}
      <RegionTag region={props.regionId} />
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("EventCourseHeader", () => EventCourseHeader);
