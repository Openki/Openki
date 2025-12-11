import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { EventModel } from "/imports/api/events/events";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { OrganizationTag } from "../../../organizations/tag";
import { Add } from "./Add";
import { Remove } from "./Remove";
import { RemoveOrganizer } from "./RemoveOrganizer";
import { MakeOrganizer } from "./MakeOrganizer";

export interface Props {
  event: EventModel;
}

export function OrganizationList({ event }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(event.region);

  function tools(organizationId: string, event: EventModel) {
    // Organizations may be adopted from the course, these cannot be removed
    const ownOrganization = event.groups.includes(organizationId);

    return (
      <>
        {ownOrganization && (!!user?.mayPromoteWith(organizationId) || event.editableBy(user)) && (
          <li className="dialog-dropdown-btn">
            <Remove event={event} organizationId={organizationId} />
          </li>
        )}
        {ownOrganization && event.editableBy(user) && (
          <li className="dialog-dropdown-btn">
            {event.groupOrganizers.includes(organizationId) ? (
              <RemoveOrganizer event={event} organizationId={organizationId} />
            ) : (
              <MakeOrganizer event={event} organizationId={organizationId} />
            )}
          </li>
        )}
      </>
    );
  }

  if (isRegionLoading()) return null;

  const organizations = event.allGroups?.filter(
    (organizationId) =>
      !(
        // hide organization where are from the region set
        (
          region?.defaultTeamGroups?.includes(organizationId) &&
          // when user ist not member of the organization or a admin
          !user?.mayPromoteWith(organizationId) &&
          !event.editableBy(user)
        )
      ),
  );

  return (
    <div className="tag-group multiline">
      {organizations?.map((organizationId) => {
        const isOrganizer = event.editors.includes(organizationId);
        // Organization may be adopted from the course, these cannot be removed
        const ownOrganization = event.groups.includes(organizationId);
        return (
          <React.Fragment key={organizationId}>
            <OrganizationTag organizationId={organizationId} isOrganizer={isOrganizer} />
            {isOrganizer && (
              <div className="tag group-tag addon">
                <i
                  className="fa-solid fa-bullhorn fa-fw"
                  title={t("course.organizationList.title.organizedBy", {
                    COURSE: event.title,
                  })}
                />
              </div>
            )}

            {ownOrganization &&
              (!!user?.mayPromoteWith(organizationId) || event.editableBy(user)) && (
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
                      {t("course.organizationList.dropdownTitle.editOrganization", "Edit group")}
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
