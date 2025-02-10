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

export function Remove({ course, groupId }: Props) {
  const { t } = useTranslation();
  const [isLoading, group] = useDetails(groupId);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading()) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        className="btn btn-danger"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
      >
        {t("course.group.remove", "Remove")}
      </button>
    );
  }

  return (
    <div className="group-tool-dialog danger">
      {t("course.group.confirmRemoveText", 'Stop listing the "{NAME}" group as promoters?', {
        NAME: name(group),
      })}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await CoursesMethods.promote(course._id, groupId, false);

            Alert.success(
              t("courseGroupAdd.groupRemoved", "{GROUP} was removed from {COURSE}.", {
                GROUP: name(group),
                COURSE: course.name,
              }),
            );
          } catch (err) {
            Alert.serverError(err, t("courseGroupAdd.groupRemoved.error", "Removing failed"));
          }
        }}
      >
        {t("course.group.confirmRemoveButton", "Delist")}
      </button>
    </div>
  );
}
