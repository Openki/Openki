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

export function Remove({ event, organizationId }: Props) {
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
        {t("course.organizationList.remove")}
      </button>
    );
  }

  return (
    <div className="group-tool-dialog danger">
      {t("course.organizationList.confirmRemoveText", {
        NAME: name(organization),
      })}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await EventsMethods.promote(event._id, organizationId, false);

            Alert.success(
              t(
                "course.organizationList.remove.organizationRemoved.success",
                "{ORGANIZATION} was removed from {COURSE}.",
                {
                  ORGANIZATION: name(organization),
                  COURSE: event.title,
                },
              ),
            );
          } catch (err) {
            Alert.serverError(
              err,
              t("course.organizationList.remove.organizationRemoved.error", "Removing failed"),
            );
          }
        }}
      >
        {t("course.organizationList.remove.confirmRemoveButton")}
      </button>
    </div>
  );
}
