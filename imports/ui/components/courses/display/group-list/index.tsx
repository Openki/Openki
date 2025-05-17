import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseModel } from "/imports/api/courses/courses";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { GroupTag } from "/imports/ui/components/groups/tag";
import { Add } from "./Add";
import { Remove } from "./Remove";
import { RemoveOrganizer } from "./RemoveOrganizer";
import { MakeOrganizer } from "./MakeOrganizer";

export interface Props {
  course: CourseModel;
}

export function GroupList({ course }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(course.region);

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

  if (isRegionLoading()) return null;

  const groups = course.groups.filter(
    (groupId) =>
      !(
        // hide group where are from the region set
        (
          region?.defaultTeamGroups?.includes(groupId) &&
          // when user ist not member of the group or a admin
          !user?.mayPromoteWith(groupId) &&
          !course.editableBy(user)
        )
      ),
  );

  return (
    <div className="tag-group multiline">
      {groups.map((groupId) => {
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

import "./template.html";

Template.registerHelper("CourseGroupList", () => GroupList);
