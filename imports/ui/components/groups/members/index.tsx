import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import { SystemRoles } from "/imports/api/groups/lib/Role";
import { GroupModel } from "/imports/api/groups/groups";
import { isParticipant } from "/imports/api/groups/lib/isRole";

import { Member } from "./member";

import "./styles.scss";

export function Members({ group }: { group: GroupModel }) {
  const { t } = useTranslation();
  const user = useUser();

  const increaseBy = 10;
  const [membersDisplayLimit, setMembersDisplayLimit] = useState(increaseBy);

  function howManyEnrolled() {
    if (!group) {
      return undefined;
    }
    return group.members.length;
  }
  function canNotifyAll() {
    if (user?.hasPrivilege("admin")) {
      return true;
    }

    return !!(
      group?.userHasRole(user?._id, SystemRoles.Team) ||
      user?.organizations.some((g) => group?.teamOrganizations.includes(g))
    );
  }
  function sortedMembers() {
    if (!group) {
      return undefined;
    }
    const { members } = group;
    members.sort((a, b) => {
      const aRoles = a.roles.filter((role) => !isParticipant(role));
      const bRoles = b.roles.filter((role) => !isParticipant(role));
      return bRoles.length - aRoles.length;
    });
    // check if logged-in user is in members and if so put him on top
    const userId = user?._id;
    if (userId && members.some((member) => member.user === userId)) {
      const userArrayPosition = members.findIndex((member) => member.user === userId);
      const currentMember = members[userArrayPosition];
      // remove current user form array and readd him at index 0
      members.splice(userArrayPosition, 1); // remove
      members.splice(0, 0, currentMember); // readd
    }
    return members.slice(0, membersDisplayLimit);
  }
  function limited() {
    return (group?.members.length || 0) > membersDisplayLimit;
  }

  function handleContactMembersClick() {
    document.getElementById("discussion")?.dispatchEvent(new Event("notifyAll"));
  }

  function handleShowMoreMembersClick() {
    setMembersDisplayLimit(membersDisplayLimit + increaseBy);
  }

  return (
    <>
      <div className="page-component-header">
        <h4>
          {t(
            "group.details.members.title",
            "{NUM, plural, =0{No interested yet} one{1 interested} other{# interested} }",
            { NUM: howManyEnrolled() },
          )}{" "}
          {canNotifyAll() && (
            <i
              className="fa-solid fa-paper-plane contact-members"
              data-bs-title={t("group.details.members.contact-members", "Contact all members")}
              onClick={handleContactMembersClick}
            />
          )}
        </h4>
      </div>
      {!!group?.members && (
        <div className="group-members">
          {sortedMembers()?.map((member) => (
            <Member key={member.user} member={member} group={group} />
          ))}
          {limited() && (
            <button
              className="btn btn-add page-component-btn"
              type="button"
              onClick={handleShowMoreMembersClick}
            >
              {t("_button.more")}
            </button>
          )}
        </div>
      )}
    </>
  );
}
