import { Template } from "meteor/templating";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";

import { name } from "/imports/ui/lib/group-name-helpers";
import { useDetails } from "/imports/api/groups/publications";

export type Props = {
  event: EventModel;
  groupId: string;
};

export function RemoveOrganizer({ event, groupId }: Props) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const [isLoading, group] = useDetails(groupId);

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
        <span className="fa-solid fa-xmark fa-fw" aria-hidden="true"></span>
        {t("course.group.removeOrgText")}
      </a>
    );
  }

  return (
    <div className="group-tool-dialog danger">
      {t("course.group.confirmRemoveOrgText", { NAME: name(group) })}
      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          try {
            await EventsMethods.editing(event._id, groupId, false);

            Alert.success(
              t(
                "eventGroupAdd.membersCanNoLongerEditEvent",
                'Members of the group "{GROUP}" can no longer edit the "{EVENT}" event.',
                { GROUP: name(group), EVENT: event.title },
              ),
            );

            setIsExpanded(false);
          } catch (err) {
            Alert.serverError(
              err,
              t(
                "eventGroupAdd.membersCanNoLongerEditEvent.error",
                "Failed to remove organizer status",
              ),
            );
          }
        }}
      >
        {t("course.group.confimRemoveOrgButton")}
      </button>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("EventGroupRemoveOrganizer", () => RemoveOrganizer);
