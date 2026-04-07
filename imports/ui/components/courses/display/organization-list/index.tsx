import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { GroupModel } from "/imports/api/courses/courses";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { OrganizationTag } from "../../../organizations/tag";
import { Add } from "./Add";
import { Remove } from "./Remove";
import { RemoveTeam } from "./RemoveTeam";
import { MakeTeam } from "./MakeTeam";

export interface Props {
  group: GroupModel;
}

export function OrganizationList({ group }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(group.region);

  function tools(organizationId: string, group: GroupModel) {
    return (
      <>
        {(!!user?.mayPromoteWith(organizationId) || group.editableBy(user)) && (
          <li className="dialog-dropdown-btn">
            <Remove group={group} organizationId={organizationId} />
          </li>
        )}
        {group.editableBy(user) && (
          <li className="dialog-dropdown-btn">
            {group.teamOrganizations.includes(organizationId) ? (
              <RemoveTeam group={group} organizationId={organizationId} />
            ) : (
              <MakeTeam group={group} organizationId={organizationId} />
            )}
          </li>
        )}
      </>
    );
  }

  if (isRegionLoading()) return null;

  const organizations = group.organizations.filter(
    (organizationId) =>
      !(
        // hide organization where are from the region set
        (
          region?.defaultTeamOrganizations?.includes(organizationId) &&
          // when user ist not member of the organization or a admin
          !user?.mayPromoteWith(organizationId) &&
          !group.editableBy(user)
        )
      ),
  );

  return (
    <div className="tag-group multiline">
      {organizations.map((organizationId) => {
        const isTeam = group.teamOrganizations.includes(organizationId);
        return (
          <React.Fragment key={organizationId}>
            <OrganizationTag organizationId={organizationId} isTeam={isTeam} />
            {isTeam && (
              <div className="tag organization-tag addon">
                <i
                  className="fa-solid fa-bullhorn fa-fw"
                  title={t(
                    "course.organizationList.title.organizedBy",
                    "{COURSE} is co-organized by this organization",
                    {
                      COURSE: group.name,
                    },
                  )}
                />
              </div>
            )}

            {(!!user?.mayPromoteWith(organizationId) || group.editableBy(user)) && (
              <div className="btn-group tag-btn organization-tag-btn addon align-top">
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
                  {tools(organizationId, group)}
                </ul>
              </div>
            )}
          </React.Fragment>
        );
      })}

      <Add group={group} />
    </div>
  );
}
