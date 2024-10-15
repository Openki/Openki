import React from "react";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { Roles } from "/imports/api/roles/roles";
import { Subscribe, Unsubscribe, Message, processChange } from "/imports/api/courses/subscription";
import { CourseMemberEntity, CourseModel } from "/imports/api/courses/courses";
import * as Users from "/imports/api/users/publications";

import * as Tooltips from "/imports/utils/Tooltips";

import { useUser } from "/imports/utils/react-meteor-data";
import { ProfileLink } from "/imports/ui/components/profile-link";
import { Contribution } from "../../../contribution";
import { ParticipantContact } from "/imports/ui/components/participant/contact";
import { RemoveFromTeamDropdown } from "../remove-from-team-dropdown";

import "./styles.scss";
import { Editable } from "../../../editable/index.react";

function roleShort(type: string) {
  return `roles.${type}.short`;
}

export function Member({ member, course }: { member: CourseMemberEntity; course: CourseModel }) {
  const { t } = useTranslation();
  const currentUser = useUser();

  const [isLoading, user] = Users.useDetails(member.user);

  function subscribeToTeam() {
    if (!user) return undefined; // Probably not loaded yet

    return new Subscribe(course, user, "team", "interested");
  }

  function removeFromTeam() {
    if (!user) return undefined; // Probably not loaded yet

    return new Unsubscribe(course, user, "team");
  }

  function ownUserMemberClass() {
    if (member.user === currentUser?._id) {
      return "is-own-user";
    }
    return "";
  }
  function memberRoles() {
    return member.roles.filter((role) => role !== "participant");
  }
  function maySubscribeToTeam() {
    const change = subscribeToTeam();
    return change?.validFor(currentUser);
  }
  function rolelistIcon(roletype: string) {
    if (roletype !== "participant") {
      return Roles.find((role) => role.type === roletype)?.icon || "";
    }
    return "";
  }
  function rolelistIsProposal(roletype: string) {
    if (roletype !== "participant") {
      return Roles.find((role) => role.type === roletype)?.proposal;
    }
    return "";
  }
  function editableMessage() {
    const mayChangeComment = member.user === currentUser?._id;
    return mayChangeComment;
  }
  function mayUnsubscribeFromTeam(label: string) {
    if (label !== "team") {
      return false;
    }
    const change = removeFromTeam();
    return change && change.validFor(currentUser);
  }
  function showMemberComment() {
    const mayChangeComment = member.user === currentUser?._id;
    return member.comment || mayChangeComment;
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

  if (isLoading()) {
    return null;
  }

  return (
    <div className={`course-member ${ownUserMemberClass()}`}>
      <div className="clearfix">
        <ProfileLink userId={member.user} />
        <Contribution userId={member.user} />
        <ParticipantContact participant={member.user} course={course} />
        <div className="course-member-roles">
          {memberRoles().length
            ? memberRoles().map((role) => (
                <div
                  className={`course-member-role float-end ${
                    rolelistIsProposal(role) ? "is-proposal" : ""
                  }`}
                >
                  <span className="course-member-role-text">
                    <span className={`${rolelistIcon(role)} fa-fw`} aria-hidden="true"></span>
                    <span className="role-short">{roleShort(role)}</span>
                  </span>
                  {mayUnsubscribeFromTeam(role) ? (
                    <RemoveFromTeamDropdown {...removeFromTeamDropdownAttr()} />
                  ) : null}
                </div>
              ))
            : null}
          {maySubscribeToTeam() ? (
            <button
              type="button"
              className="btn btn-sm btn-add float-end add-to-team-btn"
              data-bs-toggle="tooltip"
              data-bs-title={t("course.roles.maketeam", "Add to team")}
              onClick={async () => {
                Tooltips.hide();
                const change = subscribeToTeam();
                if (!change) {
                  throw new Error("Unexpected falsy: change");
                }
                await processChange(change);
              }}
            >
              <span className={`fa-solid fa-plus ${member.user}`}></span>
              <span className="fa-solid fa-bullhorn fa-fw" aria-hidden="true"></span>
            </button>
          ) : null}
        </div>
      </div>

      {showMemberComment() ? (
        <div className="course-member-comment">
          <div className="course-member-comment-arrow"></div>
          <div className="course-member-comment-body">
            {editableMessage() ? (
              <Editable
                {...{
                  multiline: false,
                  placeholderText: t("roles.message.placeholder", "My interests…"),
                  store: {
                    onSave: async (newMessage) => {
                      const change = new Message(course, currentUser, newMessage);
                      await processChange(change);
                    },
                    onSuccess: () => {
                      Alert.success(
                        t("courseMember.messageChanged", "Your enroll-message has been changed."),
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
      ) : null}
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseMember", () => Member);
