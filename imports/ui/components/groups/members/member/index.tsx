import React from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { GroupMember, GroupModel } from "/imports/api/groups/groups";

import { useUser } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { ProfileLink } from "/imports/ui/components/profile-link";
import { Contribution } from "../../../Contribution";
import { ParticipantContact } from "/imports/ui/components/participant/contact";
import { RemoveFromTeamDropdown } from "../remove-from-team-dropdown";
import { Editable } from "/imports/ui/components/editable";
import { RoleIcon } from "/imports/ui/components/RoleIcon";

import "./styles.scss";
import { isParticipant, isPredefined, isTeam } from "/imports/api/groups/lib/isRole";
import {
  addMemberToTeam,
  removeMemberFromTeam,
  updateMemberMessage,
} from "/imports/api/groups/methods";
import { canAddToTeam, canRemoveFromTeam } from "/imports/api/groups/lib/teamPermissions";

export function Member({ member, group }: { member: GroupMember; group: GroupModel }) {
  const { t } = useTranslation();
  const currentUser = useUser();

  const [isRolesLoading, regionRoles] = useRegionRoles(group.region);
  const { roleShort } = useRoleDisplay(regionRoles);

  function memberRoles() {
    const roles = member.roles.filter((role) => !isParticipant(role));

    return group.roles.filter((role) =>
      roles.some((memberRole) => memberRole.id === role.id && memberRole.type === role.type),
    );
  }

  function showMemberComment() {
    const canChangeComment = member.user === currentUser?._id;
    return member.comment || canChangeComment;
  }

  async function handleAddToTeamClick() {
    await addMemberToTeam(group._id, member.user);
  }
  function removeFromTeamDropdownAttr() {
    return {
      member,
      onClick: async () => {
        await removeMemberFromTeam(group._id, member.user);
      },
    };
  }

  return (
    <div className={cx("group-member", member.user === currentUser?._id && "bg-user")}>
      <div className="d-flex flex-wrap align-items-center">
        <div className="me-1">
          <ProfileLink userId={member.user} />
          <Contribution userId={member.user} />
        </div>
        <ParticipantContact participant={member.user} group={group} />
        <div className="ms-auto d-flex flex-wrap align-items-center">
          {!isRolesLoading() &&
            memberRoles().map((role) => (
              <div
                key={`${role.id}${role.type}`}
                className={cx(
                  "group-member-role",
                  isPredefined(role) &&
                    regionRoles.find((r) => r.id === role.id)?.proposal &&
                    "is-proposal",
                )}
              >
                <span className="group-member-role-text">
                  <RoleIcon role={role} regionId={group.region} />{" "}
                  <span className="role-short">{roleShort(role)}</span>
                </span>{" "}
                {isTeam(role) &&
                  !!currentUser &&
                  canRemoveFromTeam(currentUser, group, member.user) && (
                    <RemoveFromTeamDropdown {...removeFromTeamDropdownAttr()} />
                  )}
              </div>
            ))}
          {currentUser && canAddToTeam(currentUser, group, member.user) && (
            <button
              type="button"
              className="btn btn-sm btn-add add-to-team-btn"
              data-bs-title={t("group.roles.maketeam", "Add to team")}
              onClick={handleAddToTeamClick}
            >
              <i className={cx("fa-solid fa-plus", member.user)} />{" "}
              <i className="fa-solid fa-bullhorn fa-fw" />
            </button>
          )}
        </div>
      </div>

      {!!showMemberComment() && (
        <div className="group-member-comment">
          <div className="group-member-comment-arrow"></div>
          <div className="group-member-comment-body">
            {member.user === currentUser?._id && currentUser ? (
              <Editable
                {...{
                  multiline: false,
                  placeholderText: t("groupMember.message.placeholder", "My interests…"),
                  store: {
                    onSave: async (newMessage) => {
                      await updateMemberMessage(group._id, newMessage);
                    },
                    onSuccess: () => {
                      Alert.success(
                        t("groupMember.messageChanged", "Your enroll-message has been changed."),
                      );
                    },
                  },
                  text: member.comment,
                }}
              />
            ) : (
              member.comment
            )}
          </div>
        </div>
      )}
    </div>
  );
}
