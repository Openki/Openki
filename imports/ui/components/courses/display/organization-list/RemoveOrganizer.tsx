import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { CourseModel } from "/imports/api/courses/courses";
import { useDetails } from "../../../../../api/organizations/publications";
import * as CoursesMethods from "/imports/api/courses/methods";

import { name } from "../../../../lib/organization-name-helpers";

export interface Props {
  course: CourseModel;
  groupId: string;
}

export function RemoveOrganizer({ course, groupId }: Props) {
  const { t } = useTranslation();
  const [isLoading, group] = useDetails(groupId);
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
        {t("course.group.removeOrgText", "Remove editing rights")}
      </a>
    );
  }

  return (
    <div className="group-tool-dialog danger">
      {t(
        "course.group.confirmRemoveOrgText",
        'Revoke all editing rights from the "{NAME}" group?',
        { NAME: name(group) },
      )}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await CoursesMethods.editing(course._id, groupId, false);

            Alert.success(
              t(
                "courseGroupAdd.membersCanNoLongerEditCourse",
                "Members of {GROUP} can no longer edit {COURSE}.",
                { GROUP: name(group), COURSE: course.name },
              ),
            );
          } catch (err) {
            Alert.serverError(
              err,
              t(
                "courseGroupAdd.membersCanNoLongerEditCourse.error",
                "Failed to remove organizer status",
              ),
            );
          }
        }}
      >
        {t("course.group.confimRemoveOrgButton", "Take away editing rights")}
      </button>
    </div>
  );
}
