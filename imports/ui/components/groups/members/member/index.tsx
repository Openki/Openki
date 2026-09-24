import React from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { Subscribe, Unsubscribe, Message, processChange } from "/imports/api/groups/subscription";
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

export function Member({ member, group }: { member: GroupMember; group: GroupModel }) {
  const { t } = useTranslation();
  const currentUser = useUser();

  const [isRolesLoading, roles] = useRegionRoles(group.region);
  const { roleShort } = useRoleDisplay(roles);

  function subscribeToTeam() {
    return new Subscribe(
      group,
      roles.map((r) => r.id),
      member.user,
      "team",
      "interested",
    );
  }

  function removeFromTeam() {
    return new Unsubscribe(group, member.user, "team");
  }

  function memberRoles() {
    return member.roles.filter((role) => role !== "participant");
  }
  function canSubscribeToTeam() {
    const change = subscribeToTeam();
    return change?.validFor(currentUser);
  }

  function editableMessage() {
    const canChangeComment = member.user === currentUser?._id;
    return canChangeComment;
  }
  function canUnsubscribeFromTeam(label: string) {
    if (label !== "team") {
      return false;
    }
    const change = removeFromTeam();
    return change && change.validFor(currentUser);
  }
  function showMemberComment() {
    const canChangeComment = member.user === currentUser?._id;
    return member.comment || canChangeComment;
  }
  function removeFromTeamDropdownAttr() {
    return {
      member,
      onClick: async () => {
        const change = removeFromTeam();
        if (!change) {
          throw new Error("Unexpected falsy: change");
        }
        await processChange(change);
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
                key={role}
                className={cx(
                  "group-member-role",
                  roles.find((r) => r.id === role)?.proposal && "is-proposal",
                )}
              >
                <span className="group-member-role-text">
                  <RoleIcon id={role} regionId={group.region} />{" "}
                  <span className="role-short">{roleShort(role)}</span>
                </span>{" "}
                {canUnsubscribeFromTeam(role) && (
                  <RemoveFromTeamDropdown {...removeFromTeamDropdownAttr()} />
                )}
              </div>
            ))}
          {canSubscribeToTeam() && (
            <button
              type="button"
              className="btn btn-sm btn-add add-to-team-btn"
              data-bs-title={t("group.roles.maketeam", "Add to team")}
              onClick={async () => {
                const change = subscribeToTeam();
                if (!change) {
                  throw new Error("Unexpected falsy: change");
                }
                await processChange(change);
              }}
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
            {editableMessage() && currentUser ? (
              <Editable
                {...{
                  multiline: false,
                  placeholderText: t("groupMember.message.placeholder", "My interests…"),
                  store: {
                    onSave: async (newMessage) => {
                      const change = new Message(group, currentUser._id, newMessage);
                      await processChange(change);
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
