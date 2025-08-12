import React from "react";
import { useTranslation } from "react-i18next";
import { Template } from "meteor/templating";
import { Router } from "meteor/iron:router";

import { GroupModel } from "/imports/api/groups/groups";
import { useDetails } from "/imports/api/groups/publications";

import { name } from "/imports/ui/lib/group-name-helpers";

import "./styles.scss";

function short(group: GroupModel | undefined) {
  return group ? group.short : "-";
}

export interface Props {
  groupId: string;
  full?: boolean;
  isOrganizer?: boolean;
  onClick?: () => Promise<void>;
  onMouseOver?: () => Promise<void>;
  onMouseOut?: () => Promise<void>;
}

export function GroupTag({ groupId, full, isOrganizer, onMouseOver, onMouseOut, onClick }: Props) {
  const { t } = useTranslation();
  const [isLoading, group] = useDetails(groupId);

  return (
    <div className={`tag tag-link group-tag ${isOrganizer ? "group-tag-is-organizer" : ""}`}>
      {isLoading() ? (
        <span className="placeholder" style={{ width: full ? "100px" : "40px" }}></span>
      ) : (
        <a
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          onClick={onClick}
          href={Router.path("groupDetails", group)}
          data-bs-title={t("groupList.show_courses", "{NAME}, show all their courses", {
            NAME: name(group),
          })}
        >
          {full ? name(group) : short(group)}
        </a>
      )}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("GroupTag", () => GroupTag);
