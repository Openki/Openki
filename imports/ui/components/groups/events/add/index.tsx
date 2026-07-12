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
        data-bs-title={t("group.event.edit.add")}
      >
        <h4 className="fw-bold">
          <i className="fa-regular fa-calendar-plus" />
          &nbsp;
          {t("group.event.edit.add", "Create Event")}
        </h4>
      </a>
    </div>
  );
}
