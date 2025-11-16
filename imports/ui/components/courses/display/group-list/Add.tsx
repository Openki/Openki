import React from "react";
import { difference } from "lodash-es";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { CourseModel } from "/imports/api/courses/courses";
import { useDetails } from "/imports/api/groups/publications";
import * as CoursesMethods from "/imports/api/courses/methods";

import { name } from "/imports/ui/lib/group-name-helpers";

function GroupToAdd({ course, groupId }: { course: CourseModel; groupId: string }) {
  const { t } = useTranslation();
  const [isLoading, group] = useDetails(groupId);

  if (isLoading()) {
    return null;
  }

  return (
    <li>
      <button
        className="btn btn-link"
        type="button"
        value={groupId}
        onClick={async () => {
          try {
            await CoursesMethods.promote(course._id, groupId, true);

            Alert.success(
              t("courseGroupAdd.groupAdded", "{GROUP} was added to promote {COURSE}.", {
                GROUP: name(group),
                COURSE: course.name,
              }),
            );
          } catch (err) {
            Alert.serverError(err, t("courseGroupAdd.groupAdded.error", "Adding failed"));
          }
        }}
      >
        {name(group)}
      </button>
    </li>
  );
}

export interface Props {
  course: CourseModel;
}

export function Add({ course }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const groupsToAdd = user && difference(user.groups, course.groups);

  if (!groupsToAdd) {
    return null;
  }

  return (
    <div className="btn-group tag-btn group-tag-btn align-top">
      <button
        type="button"
        className="dropdown-toggle"
        aria-expanded="false"
        aria-haspopup="true"
        data-bs-toggle="dropdown"
      >
        <span className="fa-solid fa-plus fa-fw" aria-hidden="true"></span>
        <span>{t("course.group.addText", "link a group")}</span>
      </button>
      <ul className="dropdown-menu dialog-dropdown">
        <li className="dropdown-header">
          {t("grouplist.addgroups.header", "Add group")}
          <button type="button" className="btn-close"></button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        {groupsToAdd.map((groupId) => (
          <GroupToAdd key={groupId} course={course} groupId={groupId} />
        ))}
        <li className="dialog-dropdown-btn">
          <a href={Router.path("groupDetails", { _id: "create" })} className="btn btn-success">
            {t("profile.createNewGroup.button")}
          </a>
        </li>
      </ul>
    </div>
  );
}
