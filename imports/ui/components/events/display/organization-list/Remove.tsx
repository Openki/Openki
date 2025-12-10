import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import { useDetails } from "../../../../../api/organizations/publications";
import * as EventsMethods from "/imports/api/events/methods";

import { name } from "../../../../lib/organization-name-helpers";

export interface Props {
  event: EventModel;
  groupId: string;
}

export function Remove({ event, groupId }: Props) {
  const { t } = useTranslation();
  const [isLoading, group] = useDetails(groupId);
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
        {t("course.group.remove")}
      </button>
    );
  }

  return (
    <div className="group-tool-dialog danger">
      {t("course.group.confirmRemoveText", {
        NAME: name(group),
      })}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await EventsMethods.promote(event._id, groupId, false);

            Alert.success(
              t("courseGroupAdd.groupRemoved", "{GROUP} was removed from {COURSE}.", {
                GROUP: name(group),
                COURSE: event.title,
              }),
            );
          } catch (err) {
            Alert.serverError(err, t("courseGroupAdd.groupRemoved.error", "Removing failed"));
          }
        }}
      >
        {t("course.group.confirmRemoveButton")}
      </button>
    </div>
  );
}
