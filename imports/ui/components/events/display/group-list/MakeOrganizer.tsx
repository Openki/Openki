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

export function MakeOrganizer({ event, groupId }: Props) {
  const { t } = useTranslation();
  const [isLoading, group] = useDetails(groupId);
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
        <span className="fa-solid fa-bullhorn fa-fw" aria-hidden="true"></span>{" "}
        {t("course.group.addOrgText", "Give editing rights")}
      </a>
    );
  }

  return (
    <div className="group-tool-dialog add">
      {t("course.group.confirmOrgText", {
        NAME: name(group),
      })}
      {t(
        "event.group.confirmOrgNotes",
        "All members of this group will be able to edit this event.",
      )}
      <button
        type="button"
        className="btn btn-success"
        onClick={async () => {
          try {
            await EventsMethods.editing(event._id, groupId, true);

            Alert.success(
              t(
                "eventGroupAdd.membersCanEditEvent",
                'Members of the group "{GROUP}" can now edit the "{EVENT}" event.',
                {
                  GROUP: name(group),
                  Event: event.title,
                },
              ),
            );
          } catch (err) {
            Alert.serverError(
              err,
              t("eventGroupAdd.membersCanEditEvent.error", "Failed to give group editing rights"),
            );
          }
        }}
      >
        {t("course.group.confimOrgButton")}
      </button>
    </div>
  );
}
