import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { GroupModel } from "/imports/api/groups/groups";
import { useDetails } from "/imports/api/organizations/publications";
import * as GroupsMethods from "/imports/api/groups/methods";

import { name } from "../../../../lib/organization-name-helpers";

export interface Props {
  group: GroupModel;
  organizationId: string;
}

export function MakeTeam({ group, organizationId }: Props) {
  const { t } = useTranslation();
  const [isLoading, organization] = useDetails(organizationId);
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
        <i className="fa-solid fa-bullhorn fa-fw" />{" "}
        {t("group.organizationList.addOrgText", "Give editing rights")}
      </a>
    );
  }

  return (
    <div className="organization-tool-dialog add">
      {t(
        "group.organizationList.confirmOrgText",
        'Add members of the "{NAME}" organization as editors?',
        {
          NAME: name(organization),
        },
      )}{" "}
      {t(
        "group.organizationList.confirmOrgNotes",
        "All members of the organization will be able to edit the group and create new events for it.",
      )}
      <button
        type="button"
        className="btn btn-success"
        onClick={async () => {
          try {
            await GroupsMethods.editing(group._id, organizationId, true);
          } catch (err) {
            Alert.serverError(
              err,
              t(
                "group.organizationList.makeTeam.membersCanEditGroup.error",
                "Failed to give editing rights",
              ),
            );
          }
        }}
      >
        {t("group.organizationList.makeTeam.confirmOrgButton", "Give editing rights")}
      </button>
    </div>
  );
}
