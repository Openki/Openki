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

export function RemoveOrganizer({ course, organizationId }: Props) {
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
        className="btn btn-danger"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
      >
        <i className="fa-solid fa-xmark fa-fw" />
        {t("course.organizationList.removeOrganizer.removeOrgText", "Remove editing rights")}
      </a>
    );
  }

  return (
    <div className="group-tool-dialog danger">
      {t(
        "course.organizationList.removeOrganizer.confirmRemoveOrgText",
        'Revoke all editing rights from the "{NAME}" organization?',
        { NAME: name(organization) },
      )}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await CoursesMethods.editing(course._id, organizationId, false);

            Alert.success(
              t(
                "course.organizationList.removeOrganizer.membersCanNoLongerEditCourse",
                "Members of {ORGANIZATION} can no longer edit {COURSE}.",
                { ORGANIZATION: name(organization), COURSE: course.name },
              ),
            );
          } catch (err) {
            Alert.serverError(
              err,
              t(
                "course.organizationList.removeOrganizer.membersCanNoLongerEditCourse.error",
                "Failed to remove organizer status",
              ),
            );
          }
        }}
      >
        {t(
          "course.organizationList.removeOrganizer.confimRemoveOrgButton",
          "Take away editing rights",
        )}
      </button>
    </div>
  );
}
