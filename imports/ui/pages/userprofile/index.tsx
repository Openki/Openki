import { Router } from "meteor/iron:router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import * as Courses from "/imports/api/courses/publications";
import * as emailMethods from "/imports/api/emails/methods";
import { GroupEntity } from "../../../api/organizations/organizations";
import * as GroupsMethods from "../../../api/organizations/methods";
import * as Groups from "../../../api/organizations/publications";
import * as usersMethods from "/imports/api/users/methods";
import { UserModel } from "/imports/api/users/users";

import { checkContribution } from "/imports/utils/checkContribution";
import { MetaTags } from "/imports/ui/components/MetaTags";
import * as Tooltips from "/imports/utils/Tooltips";

import { Avatar } from "../../components/avatar";
import { Button, ButtonCancel } from "/imports/ui/components/Buttons";
import { ButtonDelete } from "../../components/Buttons";
import { Contribution } from "../../components/Contribution";
import { Courselist } from "../../components/profiles/course-list";
import { SendMessage, Props as SendMessageProps } from "../../components/SendMessage";

export interface Props {
  user: UserModel;
}

export function UserprofilePage({ user }: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [verifyUserDelete, setVerifyUserDelete] = useState(false);
  const currentUser = useUser();

  const [isLoadingGroups, inviteGroups] = Groups.useFindFilter({ own: true });
  const [isLoading, coursesCreatedBy] = Courses.useFindFilter({ createdby: user?._id || "-1" });

  // What privileges the user has
  const privileges = (["admin"] as const).reduce<Record<string, boolean>>((originalPs, p) => {
    const ps = { ...originalPs };
    ps[p] = user.privileged(p);
    return ps;
  }, {});

  const alterPrivileges = currentUser?.privileged("admin") || false;
  const showPrivileges = alterPrivileges || !!user.privileges?.length;

  /**
   * whether userprofile is for the logged-in user
   */
  function ownuser() {
    return user._id === currentUser?._id;
  }
  function hasContributed() {
    return checkContribution(user.contribution);
  }
  function allowPrivateMessages() {
    return user.allowPrivateMessages || !!currentUser?.privileged("admin");
  }
  function groupMember(group: GroupEntity, user: UserModel) {
    return !!(user && group?.members?.some((m) => m.user === user._id));
  }
  function showInviteGroups() {
    if (user._id === currentUser?._id) {
      return false;
    }
    return inviteGroups.length > 0;
  }
  function showSettings() {
    if (showPrivileges) {
      return true;
    }

    if (user._id === currentUser?._id) {
      return false;
    }

    return inviteGroups.length > 0;
  }
  function sendMessageAttr(): SendMessageProps {
    return {
      autoFocus: false,
      placeholder: t("profile.mail.placeholder", "Hi {USER}. I wanted to tell you…", {
        USER: user.username,
      }),
      onSend: async (message, options) => {
        await emailMethods.sendPrivateMessage(user._id, message, options);
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
      await usersMethods.setHasContributed(user._id);
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
      await usersMethods.unsetHasContributed(user._id);
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
      await usersMethods.addPrivilege(user._id, "admin");
      Alert.success(t("privilege.addedAdmin", "Granted admin privilege"));
    } catch (err) {
      Alert.serverError(err, t("privilege.addedAdmin.error", "Unable to add privilege"));
    }
  }

  async function handleRemovePrivilege(privilege: "admin") {
    try {
      await usersMethods.removePrivilege(user._id, privilege);
      Alert.success(t("privilege.removed", "Removed privilege"));
    } catch (err) {
      Alert.serverError(err, t("privilege.removed.error", "Unable to remove privilege"));
    }
  }

  async function handleDraftIntoGroup(group: GroupEntity) {
    const { _id: groupId, name } = group;
    const userId = user._id;
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
    const userId = user._id;
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

    const userId = user._id;

    try {
      await usersMethods.adminRemove(userId, reason, { courses: true });
      Alert.success(t("profile.account.deleted", "The account has been deleted"));
      Router.go("users");
    } catch (err) {
      Alert.serverError(err);
    }
  }

  if (isLoading() || !user._id) {
    return null;
  }

  const title = t("profile.windowtitle", "Profile of {USER}", {
    USER: user?.getDisplayName() || "...",
  });

  return (
    <>
      <MetaTags title={title} />

      <div className="container mw-md">
        <div className="page-component">
          <div className="row g-3">
            <div className="col-3">
              <Avatar userId={user._id} className="profile-avatar" />
            </div>

            <div className="col-9">
              <h1 className="mt-4">
                {t("profile.users_profile_page", "{NAME}'s Profile", {
                  NAME: user.getDisplayName(),
                })}
                <Contribution userId={user._id} />
              </h1>

              {ownuser() ? (
                <em>({t("profile.its_you", "It's you.")})</em>
              ) : (
                alterPrivileges &&
                PublicSettings.contribution &&
                (!hasContributed() ? (
                  <button
                    data-test="user-has-contributed-button"
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSetHasContributed}
                  >
                    <i className={PublicSettings.contribution.icon} />{" "}
                    {t("profile.setHasContributed.button", "Mark this user has contributed")}
                  </button>
                ) : (
                  <button
                    data-test="user-has-contributed-button"
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleUnsetHasContributed}
                  >
                    {t("profile.unsetHasContributed.button", "Remove this user has contributed")}
                  </button>
                ))
              )}

              <p
                className="profile-description"
                dangerouslySetInnerHTML={{ __html: user.description }}
              ></p>

              {ownuser() ? (
                <a className="btn btn-primary" href={Router.path("profile")}>
                  <i className="fa-solid fa-gears fa-fw" />{" "}
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
                    <i className="fa-solid fa-gear fa-fw" />{" "}
                    {t("privileges.title", "Edit Privileges")}
                  </h3>
                  <div className="list-group">
                    {privileges.admin ? (
                      <li className="list-group-item list-group-item-success">
                        {alterPrivileges && (
                          <button
                            type="button"
                            className="btn-close btn-close-black float-end"
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
                    <i className="fa-solid fa-gear fa-fw" />{" "}
                    {t("userprofile.groups.header", "Edit groups")}
                  </h3>
                  <div className="list-group">
                    {inviteGroups.map((group) =>
                      groupMember(group, user) ? (
                        <li key={group._id} className="list-group-item list-group-item-success">
                          <button
                            type="button"
                            className="btn-close btn-close-black float-end"
                            data-bs-title={t(
                              "profile.group.expel",
                              "Expel from group {GROUPNAME}",
                              {
                                GROUPNAME: group.name,
                              },
                            )}
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

        <Courselist user={user} ownProfile={false} />

        {alterPrivileges && (
          <>
            <h3 className="text-danger">
              {t("profile.account.delete.header", "Is this a spammer?")}
            </h3>
            {!verifyUserDelete ? (
              <ButtonDelete id="userprofile-verifyUserDelete" onClick={toggleVerifyUserDelete} />
            ) : (
              <div className="border border-danger text-danger p-3">
                <p>
                  {t(
                    "profile.account.reallydelete",
                    'Remove the user profile "{NAME}" permanently? {COURSES, number} Courses created by this user (with {INTERESTED, number} Participants and {EVENTS, number} upcoming events) will also be removed.',
                    {
                      NAME: user.getDisplayName(),
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
                    id="userprofile-confirm-delete-user"
                    className="btn-danger"
                    onClick={() => handleConfirmDeleteUser()}
                    busyText={t("profile.account.delete.confirm.button.busy", "Deleting profile…")}
                  >
                    {t("profile.account.delete.confirm.button", "Delete user and all his traces")}
                  </Button>{" "}
                  <ButtonCancel
                    id="userprofile-confirm-delete-user-cancel"
                    onClick={toggleVerifyUserDelete}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("UserprofilePage", () => UserprofilePage);
