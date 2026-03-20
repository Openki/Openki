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

export function MakeTeam({ event, organizationId }: Props) {
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
        <i className="fa-solid fa-bullhorn fa-fw" /> {t("course.organizationList.addOrgText")}
      </a>
    );
  }

  return (
    <div className="organization-tool-dialog add">
      {t("course.organizationList.confirmOrgText", {
        NAME: name(organization),
      })}{" "}
      {t(
        "event.organizationList.confirmOrgNotes",
        "All members of the organization will be able to edit the event.",
      )}
      <button
        type="button"
        className="btn btn-success"
        onClick={async () => {
          try {
            await EventsMethods.editing(event._id, organizationId, true);
          } catch (err) {
            Alert.serverError(
              err,
              t("course.organizationList.makeTeam.membersCanEditCourse.error"),
            );
          }
        }}
      >
        {t("course.organizationList.makeTeam.confimOrgButton")}
      </button>
    </div>
  );
}
