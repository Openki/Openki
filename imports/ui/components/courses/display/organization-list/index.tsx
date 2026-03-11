import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseModel } from "/imports/api/courses/courses";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { OrganizationTag } from "../../../organizations/tag";
import { Add } from "./Add";
import { Remove } from "./Remove";
import { RemoveOrganizer } from "./RemoveOrganizer";
import { MakeOrganizer } from "./MakeOrganizer";

export interface Props {
  course: CourseModel;
}

export function OrganizationList({ course }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(course.region);

  function tools(organizationId: string, course: CourseModel) {
    return (
      <>
        {(!!user?.mayPromoteWith(organizationId) || course.editableBy(user)) && (
          <li className="dialog-dropdown-btn">
            <Remove course={course} organizationId={organizationId} />
          </li>
        )}
        {course.editableBy(user) && (
          <li className="dialog-dropdown-btn">
            {course.groupOrganizers.includes(organizationId) ? (
              <RemoveOrganizer course={course} organizationId={organizationId} />
            ) : (
              <MakeOrganizer course={course} organizationId={organizationId} />
            )}
          </li>
        )}
      </>
    );
  }

  if (isRegionLoading()) return null;

  const organizations = course.groups.filter(
    (organizationId) =>
      !(
        // hide organization where are from the region set
        (
          region?.defaultTeamOrganizations?.includes(organizationId) &&
          // when user ist not member of the organization or a admin
          !user?.mayPromoteWith(organizationId) &&
          !course.editableBy(user)
        )
      ),
  );

  return (
    <div className="tag-group multiline">
      {organizations.map((organizationId) => {
        const isOrganizer = course.groupOrganizers.includes(organizationId);
        return (
          <React.Fragment key={organizationId}>
            <OrganizationTag organizationId={organizationId} isOrganizer={isOrganizer} />
            {isOrganizer && (
              <div className="tag group-tag addon">
                <i
                  className="fa-solid fa-bullhorn fa-fw"
                  title={t(
                    "course.organizationList.title.organizedBy",
                    "{COURSE} is co-organized by this organization",
                    {
                      COURSE: course.name,
                    },
                  )}
                />
              </div>
            )}

            {(!!user?.mayPromoteWith(organizationId) || course.editableBy(user)) && (
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
                    {t(
                      "course.organizationList.dropdownTitle.editOrganization",
                      "Edit organization",
                    )}
                    <button type="button" className="btn-close"></button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  {tools(organizationId, course)}
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
