import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSessionEquals } from "/imports/utils/react-meteor-data";
import { useSiteName } from "/imports/utils/getSiteName";

import { Regions } from "/imports/api/regions/regions";
import { CourseModel } from "/imports/api/courses/courses";
import { Router } from "meteor/iron:router";
import { RoleIcon } from "/imports/ui/RoleIcon";

export type Props = {
  course: CourseModel;
  hideInterested: boolean;
};

export function Course({ course, hideInterested }: Props) {
  const { t } = useTranslation();
  const allRegions = useSessionEquals("region", "all");
  const [isExpanded, setIsExpanded] = useState(false);
  const siteName = useSiteName();

  function regionOf() {
    return Regions.findOne(course.region)?.name;
  }
  function interestedPersons() {
    return course.members.filter((m) => m.roles.includes("participant")).length;
  }

  return (
    <div className="frame-list-item">
      <h4
        className="frame-list-item-header"
        onClick={(event) => {
          event.currentTarget.classList.toggle("active");
          setIsExpanded(!isExpanded);
        }}
      >
        <span className="frame-list-item-toggle-indicator">
          <i className="fa-solid fa-angle-down"></i>
        </span>
        {!hideInterested && course.roles.includes("participant") && (
          <span
            className="frame-list-item-interested"
            title={t("frame.courseList.interestedPersons", "Interested people")}
          >
            <strong className="me-1">{interestedPersons()}</strong> <RoleIcon type="participant" />
          </span>
        )}
        {course.name}
        {!!allRegions && (
          <span className="badge bg-primary frame-list-item-region">{regionOf()}</span>
        )}
      </h4>
      {isExpanded && (
        <div className="p-2">
          <div className="row">
            <div className="col-sm-2">
              <strong>{t("frame.eventsList.description")}</strong>
            </div>
            <div
              className="col-sm-10"
              dangerouslySetInnerHTML={{ __html: course.description || "" }}
            ></div>
          </div>
          <div className="mt-2 d-grid d-sm-flex">
            <a
              className="btn btn-outline-dark"
              href={Router.path("showCourse", course)}
              target="_blank"
            >
              {t("frame.courseList.moreAboutThisCourse", "More on {SITENAME}", {
                SITENAME: siteName,
              })}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
