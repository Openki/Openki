import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import { useDetails } from "../../../../../api/organizations/publications";
import * as EventsMethods from "/imports/api/events/methods";

import { name } from "../../../../lib/organization-name-helpers";

export interface Props {
  event: EventModel;
  organizationId: string;
}

export function RemoveTeam({ event, organizationId }: Props) {
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
        {t("course.organizationList.removeOrganizer.removeOrgText")}
      </a>
    );
  }

  return (
    <div className="group-tool-dialog danger">
      {t("course.organizationList.removeOrganizer.confirmRemoveOrgText", {
        NAME: name(organization),
      })}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await EventsMethods.editing(event._id, organizationId, false);

            setIsExpanded(false);
          } catch (err) {
            Alert.serverError(
              err,
              t("course.organizationList.removeOrganizer.membersCanNoLongerEditCourse.error"),
            );
          }
        }}
      >
        {t("course.organizationList.removeOrganizer.confimRemoveOrgButton")}
      </button>
    </div>
  );
}
