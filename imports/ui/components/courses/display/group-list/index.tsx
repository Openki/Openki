import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseModel } from "/imports/api/courses/courses";
import { useDetails } from "/imports/api/courses/publications";

import { GroupTag } from "/imports/ui/components/groups/tag";
import { Add } from "./Add";
import { Remove } from "./Remove";
import { RemoveOrganizer } from "./RemoveOrganizer";
import { MakeOrganizer } from "./MakeOrganizer";

export type Props = { course: CourseModel };

export function GroupList({ course: course2 }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  // for blaze, can be removed after migration
  // subscribe in react to keep reactivity
  const [isLoading, course] = useDetails(course2._id);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function tools(groupId: string, course: CourseModel) {
    return (
      <>
        {(!!user?.mayPromoteWith(groupId) || course.editableBy(user)) && (
          <li className="dialog-dropdown-btn">
            <Remove course={course} groupId={groupId} />
          </li>
        )}
        {course.editableBy(user) && (
          <li className="dialog-dropdown-btn">
            {course.groupOrganizers.includes(groupId) ? (
              <RemoveOrganizer course={course} groupId={groupId} />
            ) : (
              <MakeOrganizer course={course} groupId={groupId} />
            )}
          </li>
        )}
      </>
    );
  }

  if (isLoading() || !course) return null;

  return (
    <div className="tag-group multiline">
      {course.groups.map((groupId) => {
        const isOrganizer = course.groupOrganizers.includes(groupId);
        return (
          <React.Fragment key={groupId}>
            <GroupTag groupId={groupId} isOrganizer={isOrganizer} />
            {isOrganizer && (
              <div className="tag group-tag addon">
                <span
                  className="fa-solid fa-bullhorn fa-fw"
                  aria-hidden="true"
                  title={t("grouplist.organizer.title", "{COURSE} is co-organized by this group", {
                    COURSE: course.name,
                  })}
                ></span>
              </div>
            )}

            {(!!user?.mayPromoteWith(groupId) || course.editableBy(user)) && (
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
                  {tools(groupId, course)}
                </ul>
              </div>
            )}
          </React.Fragment>
        );
      })}

      <Add course={course} />
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseGroupList", () => GroupList);
