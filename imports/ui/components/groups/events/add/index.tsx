import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";

import { GroupModel } from "/imports/api/groups/groups";

export interface Props {
  group: GroupModel;
}

export function Add({ group }: Props) {
  const { t } = useTranslation();

  return (
    <div id="group-event-add" className="event-caption-wrap">
      <a
        className="btn btn-add text-center page-component-btn"
        href={Router.path("createEvent", undefined, { query: { groupId: group._id } })}
      >
        <i className="fa-regular fa-calendar-plus me-1" />
        {t("group.event.edit.add", "Create event")}
      </a>
    </div>
  );
}
