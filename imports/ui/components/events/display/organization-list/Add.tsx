import React from "react";
import { difference } from "lodash-es";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import { useDetails } from "../../../../../api/organizations/publications";
import * as EventsMethods from "/imports/api/events/methods";

import { name } from "../../../../lib/organization-name-helpers";

function GroupToAdd({ event, groupId }: { event: EventModel; groupId: string }) {
  const { t } = useTranslation();
  const [isLoading, group] = useDetails(groupId);

  if (isLoading()) {
    return null;
  }

  return (
    <li>
      <button
        className="btn btn-link"
        type="button"
        value={groupId}
        onClick={async () => {
          try {
            await EventsMethods.promote(event._id, groupId, true);

            Alert.success(
              t("courseGroupAdd.groupAdded", {
                GROUP: name(group),
                COURSE: event.title,
              }),
            );
          } catch (err) {
            Alert.serverError(err, t("courseGroupAdd.groupAdded.error"));
          }
        }}
      >
        {name(group)}
      </button>
    </li>
  );
}

export interface Props {
  event: EventModel;
}

export function Add({ event }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const groupsToAdd = user && difference(user.groups, event.allGroups || []);

  if (!groupsToAdd) {
    return null;
  }

  return (
    <div className="btn-group tag-btn group-tag-btn align-top">
      <button
        type="button"
        className="dropdown-toggle"
        aria-expanded="false"
        aria-haspopup="true"
        data-bs-toggle="dropdown"
      >
        <i className="fa-solid fa-plus fa-fw" />
        <span>{t("course.group.addText")}</span>
      </button>
      <ul className="dropdown-menu dialog-dropdown">
        <li className="dropdown-header">
          {t("grouplist.addgroups.header")}
          <button type="button" className="btn-close"></button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        {groupsToAdd.map((groupId) => (
          <GroupToAdd key={groupId} event={event} groupId={groupId} />
        ))}
        <li className="dialog-dropdown-btn">
          <a href={Router.path("groupDetails", { _id: "create" })} className="btn btn-success">
            {t("profile.createNewGroup.button")}
          </a>
        </li>
      </ul>
    </div>
  );
}
