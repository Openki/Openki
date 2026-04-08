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

export function Remove({ group, organizationId }: Props) {
  const { t } = useTranslation();
  const [isLoading, organization] = useDetails(organizationId);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading()) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        type="button"
        className="btn btn-danger"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
      >
        {t("group.organizationList.remove", "Remove")}
      </button>
    );
  }

  return (
    <div className="organization-tool-dialog danger">
      {t(
        "group.organizationList.confirmRemoveText",
        'Stop listing the "{NAME}" organization as promoters?',
        {
          NAME: name(organization),
        },
      )}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await GroupsMethods.promote(group._id, organizationId, false);
          } catch (err) {
            Alert.serverError(
              err,
              t("group.organizationList.remove.organizationRemoved.error", "Removing failed"),
            );
          }
        }}
      >
        {t("group.organizationList.remove.confirmRemoveButton", "Delist")}
      </button>
    </div>
  );
}
