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
        {t("course.group.addOrgText")}
      </a>
    );
  }

  return (
    <div className="group-tool-dialog add">
      {t("course.group.confirmOrgText", {
        NAME: name(group),
      })}{" "}
      {t("event.group.confirmOrgNotes")}
      <button
        type="button"
        className="btn btn-success"
        onClick={async () => {
          try {
            await EventsMethods.editing(event._id, groupId, true);

            Alert.success(
              t("courseGroupAdd.membersCanEditCourse", {
                GROUP: name(group),
                COURSE: event.title,
              }),
            );
          } catch (err) {
            Alert.serverError(err, t("courseGroupAdd.membersCanEditCourse.error"));
          }
        }}
      >
        {t("course.group.confimOrgButton")}
      </button>
    </div>
  );
}
