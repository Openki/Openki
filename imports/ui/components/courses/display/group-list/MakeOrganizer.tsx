import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { CourseModel } from "/imports/api/courses/courses";
import { useDetails } from "/imports/api/groups/publications";
import * as CoursesMethods from "/imports/api/courses/methods";

import { name } from "/imports/ui/lib/group-name-helpers";

export type Props = {
  course: CourseModel;
  groupId: string;
};

export function MakeOrganizer({ course, groupId }: Props) {
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
        className="btn btn-success"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
      >
        <span className="fa-solid fa-bullhorn fa-fw" aria-hidden="true"></span>{" "}
        {t("course.group.addOrgText", "Give editing rights")}
      </a>
    );
  }

  return (
    <div className="group-tool-dialog add">
      {t("course.group.confirmOrgText", 'Add members of the "{NAME}" group as editors?', {
        NAME: name(group),
      })}
      {t(
        "course.group.confirmOrgNotes",
        "All members of the group will be able to edit the course and create new events for it.",
      )}
      <button
        type="button"
        className="btn btn-success"
        onClick={async () => {
          try {
            await CoursesMethods.editing(course._id, groupId, true);

            Alert.success(
              t(
                "courseGroupAdd.membersCanEditCourse",
                "Members of {GROUP} can now edit {COURSE}.",
                {
                  GROUP: name(group),
                  COURSE: course.name,
                },
              ),
            );
          } catch (err) {
            Alert.serverError(
              err,
              t("courseGroupAdd.membersCanEditCourse.error", "Failed to give editing rights"),
            );
          }
        }}
      >
        {t("course.group.confimOrgButton", "Give editing rights")}
      </button>
    </div>
  );
}
