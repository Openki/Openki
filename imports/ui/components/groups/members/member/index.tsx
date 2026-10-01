import React from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { GroupMember, GroupModel, GroupRole } from "/imports/api/groups/groups";
import {
  addMemberToTeam,
  removeMemberFromTeam,
  updateMemberMessage,
} from "/imports/api/groups/methods";
import { RoleType } from "/imports/api/groups/lib/Role";

import { useUser } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useRegionRoles } from "/imports/ui/hooks/useRegionRoles";
import { isParticipant, isTeam } from "/imports/api/groups/lib/isRole";
import { canAddToTeam, canRemoveFromTeam } from "/imports/api/groups/lib/teamPermissions";

import { ProfileLink } from "/imports/ui/components/profile-link";
import { Contribution } from "../../../Contribution";
import { ParticipantContact } from "/imports/ui/components/participant/contact";
import { RemoveFromTeamDropdown } from "../remove-from-team-dropdown";
import { Editable } from "/imports/ui/components/editable";
import { RoleIcon } from "/imports/ui/components/RoleIcon";
import { Button } from "/imports/ui/components/Buttons";

import "./styles.scss";

export function Member({ member, group }: { member: GroupMember; group: GroupModel }) {
  const { t } = useTranslation();
  const currentUser = useUser();

  const [isRolesLoading, regionRoles] = useRegionRoles(group.region);
  const { roleShort } = useRoleDisplay(regionRoles);

  const memberIsCurrentUser = member.user === currentUser?._id;

  const roles = member.roles.filter((role) => !isParticipant(role));
  const memberRoles = group.roles.filter((role) =>
    roles.some((memberRole) => memberRole.id === role.id && memberRole.type === role.type),
  );

  /**
   * show comment when there is a comment or when the current member is the user
   * so they can add or change the comment
   */
  const shouldShowComment = Boolean(member.comment) || memberIsCurrentUser;

  function isProposalRole(role: GroupRole) {
    switch (role.type) {
      case RoleType.Predefined:
        return Boolean(regionRoles.find((r) => r.id === role.id)?.proposal);

      case RoleType.Custom:
        return true;

      default:
        throw new Error("Unexpected value for role.type");
    }
  }

  return (
    <div className={cx("group-member", memberIsCurrentUser && "bg-user")}>
      <div className="d-flex flex-wrap align-items-center">
        <div className="me-1">
          <ProfileLink userId={member.user} />
          <Contribution userId={member.user} />
        </div>
        <ParticipantContact participant={member.user} group={group} />
        <div className="ms-auto d-flex flex-wrap align-items-center gap-1">
          {!isRolesLoading() &&
            memberRoles.map((role) => (
              <div
                key={`${role.id}${role.type}`}
                className={cx("group-member-role", isProposalRole(role) && "is-proposal")}
              >
                <span className="group-member-role-text">
                  <RoleIcon role={role} regionRoles={regionRoles} />{" "}
                  <span className="role-short">{roleShort(role)}</span>
                </span>{" "}
                {isTeam(role) && canRemoveFromTeam(currentUser, group, member.user) && (
                  <RemoveFromTeamDropdown
                    member={member}
                    onClick={() => removeMemberFromTeam(group._id, member.user)}
                  />
                )}
              </div>
            ))}
          {canAddToTeam(currentUser, group, member.user) && (
            <Button
              id={`group-member-${member.user}-add-to-team-btn`}
              className="btn-sm btn-add add-to-team-btn"
              data-bs-title={t("group.roles.maketeam", "Add to team")}
              onClick={() => addMemberToTeam(group._id, member.user)}
            >
              <i className={cx("fa-solid fa-plus", member.user)} />{" "}
              <i className="fa-solid fa-bullhorn fa-fw" />
            </Button>
          )}
        </div>
      </div>

      {shouldShowComment && (
        <div className="group-member-comment">
          <div className="group-member-comment-arrow" />
          <div className="group-member-comment-body">
            {memberIsCurrentUser ? (
              <Editable
                multiline={false}
                placeholder={t("groupMember.message.placeholder", "My interests…")}
                store={{
                  onSave: (newMessage) => updateMemberMessage(group._id, newMessage),
                  onSuccess: () =>
                    Alert.success(
                      t("groupMember.messageChanged", "Your enroll-message has been changed."),
                    ),
                }}
                text={member.comment}
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
