import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { CourseModel } from "/imports/api/courses/courses";
import { useDetails } from "../../../../../api/organizations/publications";
import * as CoursesMethods from "/imports/api/courses/methods";

import { name } from "../../../../lib/organization-name-helpers";

export interface Props {
  course: CourseModel;
  organizationId: string;
}

export function MakeOrganizer({ course, organizationId }: Props) {
  const { t } = useTranslation();
  const [isLoading, organization] = useDetails(organizationId);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading()) {
    return null;
  }

  if (!isExpanded) {
    return (
      <a
        href="#"
        className="btn btn-success"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
      >
        <i className="fa-solid fa-bullhorn fa-fw" />{" "}
        {t("course.organizationList.addOrgText", "Give editing rights")}
      </a>
    );
  }

  return (
    <div className="group-tool-dialog add">
      {t(
        "course.organizationList.confirmOrgText",
        'Add members of the "{NAME}" organization as editors?',
        {
          NAME: name(organization),
        },
      )}{" "}
      {t(
        "course.organizationList.confirmOrgNotes",
        "All members of the organization will be able to edit the course and create new events for it.",
      )}
      <button
        type="button"
        className="btn btn-success"
        onClick={async () => {
          try {
            await CoursesMethods.editing(course._id, organizationId, true);

            Alert.success(
              t(
                "course.organizationList.makeOrganizer.membersCanEditCourse",
                "Members of {ORGANIZATION} can now edit {COURSE}.",
                {
                  ORGANIZATION: name(organization),
                  COURSE: course.name,
                },
              ),
            );
          } catch (err) {
            Alert.serverError(
              err,
              t(
                "course.organizationList.makeOrganizer.membersCanEditCourse.error",
                "Failed to give editing rights",
              ),
            );
          }
        }}
      >
        {t("course.organizationList.makeOrganizer.confimOrgButton", "Give editing rights")}
      </button>
    </div>
  );
}
