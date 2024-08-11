import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseModel } from "/imports/api/courses/courses";

import { GroupTag } from "/imports/ui/components/groups/tag";
import { CourseGroupAdd } from "/imports/ui/components/courses/display/group-list/add";
import { CourseGroupRemove } from "/imports/ui/components/courses/display/group-list/remove";
import { CourseGroupRemoveOrganizer } from "/imports/ui/components/courses/display/group-list/remove-organizer";
import { CourseGroupMakeOrganizer } from "/imports/ui/components/courses/display/group-list/make-organizer";

export type Props = { course: CourseModel };

export function CourseGroupList({ course }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  function tools(groupId: string) {
    return (
      <>
        {user?.mayPromoteWith(groupId) || course.editableBy(user) ? (
          <li className="dialog-dropdown-btn">
            <CourseGroupRemove course={course} groupId={groupId} />
          </li>
        ) : null}
        {user && course.editableBy(user) ? (
          <li className="dialog-dropdown-btn">
            {course.groupOrganizers.includes(groupId) ? (
              <CourseGroupRemoveOrganizer course={course} groupId={groupId} />
            ) : (
              <CourseGroupMakeOrganizer course={course} groupId={groupId} />
            )}
          </li>
        ) : null}
      </>
    );
  }

  return (
    <div className="tag-group multiline">
      {course.groups.map((groupId) => {
        const isOrganizer = course.groupOrganizers.includes(groupId);
        return (
          <React.Fragment key={groupId}>
            <GroupTag groupId={groupId} isOrganizer={isOrganizer} />
            {isOrganizer ? (
              <div className="tag group-tag addon">
                <span
                  className="fa-solid fa-bullhorn fa-fw"
                  aria-hidden="true"
                  title={t("grouplist.organizer.title", "{COURSE} is co-organized by this group", {
                    COURSE: course.name,
                  })}
                ></span>
              </div>
            ) : null}

            {user?.mayPromoteWith(groupId) || course.editableBy(user) ? (
              <div className="btn-group tag-btn group-tag-btn addon align-top">
                <button
                  type="button"
                  className="dropdown-toggle"
                  aria-expanded="false"
                  aria-haspopup="true"
                  data-bs-toggle="dropdown"
                ></button>
                <ul className="dropdown-menu dialog-dropdown">
                  <li className="dropdown-header">
                    {t("grouplist.editgroup.header", "Edit group")}
                    <button type="button" className="btn-close btn-close-white"></button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  {tools(groupId)}
                </ul>
              </div>
            ) : null}
          </React.Fragment>
        );
      })}

      <CourseGroupAdd course={course} />
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseGroupList", () => CourseGroupList);
