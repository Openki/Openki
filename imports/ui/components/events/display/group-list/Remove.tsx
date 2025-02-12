import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/groups/publications";
import * as EventsMethods from "/imports/api/events/methods";

import { name } from "/imports/ui/lib/group-name-helpers";

export type Props = {
  event: EventModel;
  groupId: string;
};

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
        {t("course.group.remove", "Remove")}
      </button>
    );
  }

  return (
    <div className="group-tool-dialog danger">
      {t("event.group.confirmRemoveText", 'Remove the "{NAME}" group from this event?', {
        NAME: name(group),
      })}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await EventsMethods.promote(event._id, groupId, false);

            Alert.success(
              t(
                "eventGroupAdd.groupRemoved",
                'The group "{GROUP}" has been removed from the "{EVENT}" event.',
                { GROUP: name(group), EVENT: event.title },
              ),
            );
          } catch (err) {
            Alert.serverError(err, t("eventGroupAdd.groupRemoved.error", "Failed to remove group"));
          }
        }}
      >
        {t("course.group.confirmRemoveButton")}
      </button>
    </div>
  );
}
