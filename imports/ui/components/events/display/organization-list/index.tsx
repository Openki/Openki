import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { EventModel } from "/imports/api/events/events";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { OrganizationTag } from "../../../organizations/tag";
import { Add } from "./Add";
import { Remove } from "./Remove";
import { RemoveTeam } from "./RemoveTeam";
import { MakeTeam } from "./MakeTeam";

export interface Props {
  event: EventModel;
}

export function OrganizationList({ event }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(event.region);

  function tools(organizationId: string, event: EventModel) {
    // Organizations can be adopted from the group, these cannot be removed
    const ownOrganization = event.organizations.includes(organizationId);

    return (
      <>
        {ownOrganization && (!!user?.canPromoteWith(organizationId) || event.editableBy(user)) && (
          <li className="dialog-dropdown-btn">
            <Remove event={event} organizationId={organizationId} />
          </li>
        )}
        {ownOrganization && event.editableBy(user) && (
          <li className="dialog-dropdown-btn">
            {event.teamOrganizations.includes(organizationId) ? (
              <RemoveTeam event={event} organizationId={organizationId} />
            ) : (
              <MakeTeam event={event} organizationId={organizationId} />
            )}
          </li>
        )}
      </>
    );
  }

  if (isRegionLoading()) return null;

  const organizations = event.allOrganizations?.filter(
    (organizationId) =>
      !(
        // hide organization where are from the region set
        region?.defaultTeamOrganizations?.includes(organizationId) &&
        // when user ist not member of the organization or a admin
        !user?.canPromoteWith(organizationId) &&
        !event.editableBy(user)
      ),
  );

  return (
    <div className="tag-group multiline">
      {organizations?.map((organizationId) => {
        const isTeam = event.editors.includes(organizationId);
        // Organization can be adopted from the group, these cannot be removed
        const ownOrganization = event.organizations.includes(organizationId);
        return (
          <React.Fragment key={organizationId}>
            <OrganizationTag organizationId={organizationId} isTeam={isTeam} />
            {isTeam && (
              <div className="tag organization-tag addon">
                <i
                  className="fa-solid fa-bullhorn fa-fw"
                  title={t("group.organizationList.title.organizedBy", {
                    GROUP: event.title,
                  })}
                />
              </div>
            )}

            {ownOrganization &&
              (!!user?.canPromoteWith(organizationId) || event.editableBy(user)) && (
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
                        "group.organizationList.dropdownTitle.editOrganization",
                        "Edit organization",
                      )}
                      <button type="button" className="btn-close"></button>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    {tools(organizationId, event)}
                  </ul>
                </div>
              )}
          </React.Fragment>
        );
      })}

      <Add event={event} />
    </div>
  );
}
