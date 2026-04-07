import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { GroupModel } from "../../../../../api/groups/groups";
import { useDetails } from "../../../../../api/organizations/publications";
import * as GroupsMethods from "../../../../../api/groups/methods";

import { name } from "../../../../lib/organization-name-helpers";

export interface Props {
  group: GroupModel;
  organizationId: string;
}

export function RemoveTeam({ group, organizationId }: Props) {
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
        className="btn btn-danger"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
      >
        <i className="fa-solid fa-xmark fa-fw" />
        {t("course.organizationList.removeTeam.removeOrgText", "Remove editing rights")}
      </a>
    );
  }

  return (
    <div className="organization-tool-dialog danger">
      {t(
        "course.organizationList.removeTeam.confirmRemoveOrgText",
        'Revoke all editing rights from the "{NAME}" organization?',
        { NAME: name(organization) },
      )}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await GroupsMethods.editing(group._id, organizationId, false);
          } catch (err) {
            Alert.serverError(
              err,
              t(
                "course.organizationList.removeTeam.membersCanNoLongerEditCourse.error",
                "Failed to remove coordination-organization status",
              ),
            );
          }
        }}
      >
        {t("course.organizationList.removeTeam.confimRemoveOrgButton", "Take away editing rights")}
      </button>
    </div>
  );
}
