import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import { GroupEntity } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import { UserModel } from "/imports/api/users/users";
import * as usersMethods from "/imports/api/users/methods";
import * as emailMethods from "/imports/api/emails/methods";
import * as Courses from "/imports/api/courses/publications";
import * as Groups from "/imports/api/groups/publications";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Metatags from "/imports/utils/metatags";
import { checkContribution } from "/imports/utils/checkContribution";
import * as Tooltips from "/imports/utils/Tooltips";

import "./template.html";
import { Avatar } from "../../components/avatar";
import { Contribution } from "../../components/contribution";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { SendMessage, Data as SendMessageData } from "/imports/ui/components/send-message";

import { Courselist } from "../../components/profiles/course-list";
import { Button, ButtonCancel, ButtonDelete } from "../../components/buttons";

export interface UserProfilePageProps {
  user: UserModel;
}

export function UserprofilePage(data: UserProfilePageProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [verifyUserDelete, setVerifyUserDelete] = useState(false);
  const user = useUser();

  // What privileges the user has
  const privileges = (["admin"] as const).reduce<Record<string, boolean>>((originalPs, p) => {
    const ps = { ...originalPs };
    ps[p] = data.user.privileged(p);
    return ps;
  }, {});

  const alterPrivileges = user?.privileged("admin") || false;
  const [isLoadingGroups, inviteGroups] = Groups.useFindFilter({ own: true });
  const showPrivileges = alterPrivileges || !!data.user.privileges?.length;

  const [isLoading, coursesCreatedBy] = Courses.useFindFilter({ createdby: data.user._id });

  /**
   * whether userprofile is for the logged-in user
   */
  function ownuser() {
    return data.user._id === user?._id;
  }
  function hasContributed() {
    return checkContribution(data.user.contribution);
  }
  function allowPrivateMessages() {
    return data.user.allowPrivateMessages || !!user?.privileged("admin");
  }
  function groupMember(group: GroupEntity, user: UserModel) {
    return !!(user && group?.members?.some((m) => m.user === user._id));
  }
  function showInviteGroups() {
    if (data.user._id === user?._id) {
      return false;
    }
    return inviteGroups.length > 0;
  }
  function showSettings() {
    if (showPrivileges) {
      return true;
    }

    if (data.user._id === user?._id) {
      return false;
    }

    return inviteGroups.length > 0;
  }
  function sendMessageAttr(): SendMessageData {
    return {
      placeholder: t("profile.mail.placeholder", "Hi {USER}. I wanted to tell you…", {
        USER: data.user.username,
      }),
      onSend: async (message, options) => {
        await emailMethods.sendPrivateMessage(data.user._id, message, options);
      },
    };
  }
  function numberOfCoursesAffectedByDelete() {
    return coursesCreatedBy.length;
  }
  function numberOfInterestedAffectedByDelete() {
    return coursesCreatedBy.reduce(
      (accumulator, currentValue) => accumulator + currentValue.interested,
      0,
    );
  }
  function numberOfFutureEventsAffectedByDelete() {
    return coursesCreatedBy.reduce(
      (accumulator, currentValue) => accumulator + currentValue.futureEvents,
      0,
    );
  }

  async function handleSetHasContributed() {
    try {
      await usersMethods.setHasContributed(data.user._id);
      Alert.success(t("profile.setHasContributed.alert", "User has contributed"));
    } catch (err) {
      Alert.serverError(
        err,
        t("profile.setHasContributed.error", "Unable to set user has contributed."),
      );
    }
  }

  async function handleUnsetHasContributed() {
    try {
      await usersMethods.unsetHasContributed(data.user._id);
      Alert.success(t("profile.unsetHasContributed.alert", "Unset user has contributed"));
    } catch (err) {
      Alert.serverError(
        err,
        t("profile.unsetHasContributed.error", "Unable to unset user has contributed."),
      );
    }
  }

  async function handleGiveAdmin() {
    try {
      await usersMethods.addPrivilege(data.user._id, "admin");
      Alert.success(t("privilege.addedAdmin", "Granted admin privilege"));
    } catch (err) {
      Alert.serverError(err, t("privilege.addedAdmin.error", "Unable to add privilege"));
    }
  }

  async function handleRemovePrivilege(privilege: "admin") {
    try {
      await usersMethods.removePrivilege(data.user._id, privilege);
      Alert.success(t("privilege.removed", "Removed privilege"));
    } catch (err) {
      Alert.serverError(err, t("privilege.removed.error", "Unable to remove privilege"));
    }
  }

  async function handleDraftIntoGroup(group: GroupEntity) {
    const { _id: groupId, name } = group;
    const userId = data.user._id;
    try {
      await GroupsMethods.updateMembership(userId, groupId, true);
      Alert.success(t("profile.group.drafted", "Added to group {NAME}", { NAME: name }));
    } catch (err) {
      Alert.serverError(err, t("profile.group.drafted.error", "Unable to draft user into group"));
    }
  }

  async function handleExpelFromGroup(group: GroupEntity) {
    Tooltips.hide();

    const { _id: groupId, name } = group;
    const userId = data.user._id;
    try {
      await GroupsMethods.updateMembership(userId, groupId, false);
      Alert.success(t("profile.group.expelled", "Expelled from group {NAME}", { NAME: name }));
    } catch (err) {
      Alert.serverError(err, t("profile.group.expelled.error", "Unable to expel user from group"));
    }
  }

  async function toggleVerifyUserDelete() {
    setVerifyUserDelete((prev) => !prev);
  }

  async function handleConfirmDeleteUser() {
    if (reason.length < 4) {
      Alert.error(t("profile.admin.remove.reason.longertext", "longer text please"));
      return;
    }

    const userId = data.user._id;

    try {
      await usersMethods.adminRemove(userId, reason, { courses: true });
      Alert.success(t("profile.account.deleted", "The account has been deleted"));
      Router.go("users");
    } catch (err) {
      Alert.serverError(err);
    }
  }

  useEffect(() => {
    const title = t("profile.windowtitle", "Profile of {USER}", {
      USER: data.user.getDisplayName(),
    });
    Metatags.setCommonTags(title);
  });

  if (isLoading()) {
    return null;
  }

  return (
    <div className="container mw-md">
      <div className="page-component">
        <div className="row g-3">
          <div className="col-3">
            <Avatar userId={data.user._id} className="profile-avatar" />
          </div>

          <div className="col-9">
            <h1 className="mt-4">
              {t("profile.users_profile_page", "{NAME}'s Profile", {
                NAME: data.user.getDisplayName(),
              })}
              <Contribution userId={data.user._id} />
            </h1>

            {ownuser() ? (
              <em>({t("profile.its_you", "It's you.")})</em>
            ) : (
              alterPrivileges &&
              PublicSettings.contribution &&
              (!hasContributed() ? (
                <button
                  type="button"
                  className="btn btn-primary js-has-contributed"
                  onClick={handleSetHasContributed}
                >
                  <i className={PublicSettings.contribution.icon} aria-hidden="true"></i>{" "}
                  {t("profile.setHasContributed.button", "Mark this user has contributed")}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary js-has-contributed"
                  onClick={handleUnsetHasContributed}
                >
                  {t("profile.unsetHasContributed.button", "Remove this user has contributed")}
                </button>
              ))
            )}

            <p
              className="profile-description"
              dangerouslySetInnerHTML={{ __html: data.user.description }}
            ></p>

            {ownuser() ? (
              <a className="btn btn-primary" href={Router.path("profile")}>
                <span className="fa-solid fa-gears fa-fw" aria-hidden="true"></span>{" "}
                {t("profile.preferenceslink", "Account settings")}
              </a>
            ) : (
              allowPrivateMessages() && <SendMessage {...sendMessageAttr()} />
            )}
          </div>
        </div>
      </div>

      {!isLoadingGroups() && showSettings() && (
        <div className="page-component page-component-seperated">
          <div className="row gap-3 mb-3">
            {showPrivileges && (
              <div className="col-md">
                <h3>
                  <span className="fa-solid fa-gear fa-fw" aria-hidden="true"></span>{" "}
                  {t("privileges.title", "Edit Privileges")}
                </h3>
                <div className="list-group">
                  {privileges.admin ? (
                    <li className="list-group-item list-group-item-success">
                      {alterPrivileges && (
                        <button
                          type="button"
                          className="btn-close btn-close-black float-end"
                          data-bs-toggle="tooltip"
                          data-bs-title={t("privilege.remove", "Remove privilege")}
                          onClick={() => handleRemovePrivilege("admin")}
                        ></button>
                      )}
                      {t("privilege.has.admin", "Administrator privileges granted")}
                    </li>
                  ) : (
                    alterPrivileges && (
                      <button
                        type="button"
                        className="list-group-item-action list-group-item-secondary btn"
                        onClick={handleGiveAdmin}
                      >
                        {t("privilege.add.admin", "Grant administrator privileges")}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {showInviteGroups() && (
              <div className="col-md">
                <h3>
                  <span className="fa-solid fa-gear fa-fw" aria-hidden="true"></span>{" "}
                  {t("userprofile.groups.header", "Edit groups")}
                </h3>
                <div className="list-group">
                  {inviteGroups.map((group) =>
                    groupMember(group, data.user) ? (
                      <li key={group._id} className="list-group-item list-group-item-success">
                        <button
                          type="button"
                          className="btn-close btn-close-black float-end"
                          data-bs-toggle="tooltip"
                          data-bs-title={t("profile.group.expel", "Expel from group {GROUPNAME}", {
                            GROUPNAME: group.name,
                          })}
                          onClick={() => handleExpelFromGroup(group)}
                        ></button>
                        {t("profile.group.member", "Member of group")}
                        <span className="group">{group.name}</span>
                      </li>
                    ) : (
                      <button
                        key={group._id}
                        type="button"
                        className="list-group-item list-group-item-action list-group-item-secondary btn"
                        onClick={() => handleDraftIntoGroup(group)}
                      >
                        {t("profile.group.draft", "Draft into group")} {group.name}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Courselist user={data.user} ownProfile={false} />

      {alterPrivileges && (
        <>
          <h3 className="text-danger">
            {t("profile.account.delete.header", "Is this a spammer?")}
          </h3>
          {!verifyUserDelete ? (
            <ButtonDelete onClick={toggleVerifyUserDelete} />
          ) : (
            <div className="border border-danger text-danger p-3">
              <p>
                {t(
                  "profile.account.reallydelete",
                  'Remove the user profile "{NAME}" permanently? {COURSES, number} Courses created by this user (with {INTERESTED, number} Participants and {EVENTS, number} upcoming events) will also be removed.',
                  {
                    NAME: data.user.getDisplayName(),
                    COURSES: numberOfCoursesAffectedByDelete,
                    INTERESTED: numberOfInterestedAffectedByDelete,
                    EVENTS: numberOfFutureEventsAffectedByDelete,
                  },
                )}
              </p>

              <div className="mb-3">
                <textarea
                  className="form-control"
                  placeholder={t(
                    "profile.account.reason.placeholder",
                    "Reason for deleting this user",
                  )}
                  onChange={(e) => setReason(e.target.value)}
                  value={reason}
                ></textarea>
              </div>

              <div className="form-actions">
                <Button
                  className="btn btn-danger"
                  onClick={() => handleConfirmDeleteUser()}
                  busyText={t("profile.account.delete.confirm.button.busy", "Deleting profile…")}
                >
                  {t("profile.account.delete.confirm.button", "Delete user and all his traces")}
                </Button>{" "}
                <ButtonCancel onClick={toggleVerifyUserDelete} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("UserprofilePage", () => UserprofilePage);
