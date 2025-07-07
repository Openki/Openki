import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { GroupTag } from "../../components/groups/tag";
import { GroupModel } from "/imports/api/groups/groups";

export function GroupSection({ groups }: { groups: GroupModel[] }) {
  const { t } = useTranslation();
  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.groups", "My groups")}</h3>
      <h5>
        {t(
          "profile.groupMembership",
          "You are {NUM_GROUPS, plural, =0{not member of any group} one{member of the group:} other{member of # groups:} }",
          {
            NUM_GROUPS: groups.length,
          },
        )}
      </h5>
      <ul className="list-unstyled">
        {groups.map((group) => (
          <li key={group._id} className="mb-3">
            <GroupTag groupId={group._id} full={true} />
          </li>
        ))}
      </ul>
      <a
        className="btn btn-add"
        href={Router.path("groupDetails", {
          _id: "create",
        })}
      >
        {t("profile.createNewGroup.button", "Create a new group")}
      </a>
    </div>
  );
}
