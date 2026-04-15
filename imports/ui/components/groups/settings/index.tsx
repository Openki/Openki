import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useUser, useUserId } from "/imports/utils/react-meteor-data";
import { useTracker } from "meteor/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { GroupModel, Groups, GroupMemberEntity } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import { UserModel } from "/imports/api/users/users";
import { useFindFilter } from "/imports/api/users/publications";

import {
  type UploadImage,
  type Data as EditableImageProps,
  EditableImage,
} from "/imports/ui/components/editable-image";
import { getUserName } from "/imports/ui/lib/getUserName";
import { DeleteConfirm } from "../../DeleteConfirm";
import { ProfileLink } from "/imports/ui/components/profile-link";
import { FormControl } from "/imports/ui/components/form-control";

import "./styles.scss";

function RemoveMember({
  user,
  notify,
  onRemove,
}: GroupMemberEntity & { onRemove: (memberId: string, memberName: string) => void }) {
  const { t } = useTranslation();
  const userName = useTracker(() => getUserName(user));
  const currentUserId = useUserId();

  return (
    <div className="tag tag-btn group-member-tag-btn-remove ">
      <button
        type="button"
        title={t("group.settings.removeFromGroup", "remove member")}
        onClick={() => {
          onRemove(user, userName);
        }}
      >
        <i className="fa-solid fa-xmark fa-fw" /> {userName}
        {currentUserId !== user &&
          (notify ? (
            <i className="fa-solid fa-bell fa-fw" />
          ) : (
            <i className="fa-solid fa-bell-slash fa-fw" />
          ))}
      </button>
    </div>
  );
}

function FoundUsers({
  group,
  userSearch,
  onAdd,
}: {
  group: GroupModel;
  userSearch: string;
  onAdd: (user: UserModel) => void;
}) {
  const { t } = useTranslation();

  const [isLoading, users] = useFindFilter(userSearch, {
    exclude: group.members.map((m) => m.user),
  });

  if (isLoading()) {
    return null;
  }

  return (
    <>
      {users.map((user) => (
        <React.Fragment key={user._id}>
          <div className="tag tag-btn group-member-tag-btn-add ">
            <button
              title={t("group.settings.addMember", "add as member")}
              type="button"
              onClick={() => onAdd(user)}
            >
              <i className="fa-solid fa-plus fa-fw" /> {user.username}
            </button>
          </div>
          <div className="tag tag-link group-member-tag-profile addon">
            <a href={Router.path("userprofile", user)} title={t("group.settings.member.profile")}>
              <i className="fa-solid fa-user fa-fw" />
            </a>
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

export interface Props {
  group: GroupModel;
}

export function GroupSettings({ group }: Props) {
  const { t } = useTranslation();
  const currentUser = useUser();
  const { calendarDayFormat } = useDateTimeFormat();
  const [userSearch, setUserSearch] = useState("");

  function logoFileUploadArgs(): EditableImageProps {
    return {
      thumbnail: { src: group?.publicLogoUrl?.(), maxSize: 150 },
      maxSize: 600, // scale the image to max width/height. Note: image scaling also happens on the server
      async onUpload(file: UploadImage) {
        const groupId = group._id;
        try {
          await GroupsMethods.updateLogo(groupId, file);
          const groupName = Groups.findOne(groupId)?.name;
          Alert.success(
            t(
              "groupSettings.group.logo.updated",
              'Changes to the "{GROUP}" group settings have been saved.',
              { GROUP: groupName },
            ),
          );
        } catch (err) {
          Alert.serverError(
            err,
            t("groupSettings.group.logo.updated.error", "Could not save settings"),
          );
        }
      },
      onDelete: group?.logoUrl
        ? async function () {
            const groupId = group._id;
            try {
              await GroupsMethods.deleteLogo(groupId);
              const groupName = Groups.findOne(groupId)?.name;
              Alert.success(
                t(
                  "groupSettings.group.logo.removed",
                  'Changes to the "{GROUP}" group settings have been saved.',
                  { GROUP: groupName },
                ),
              );
            } catch (err) {
              Alert.serverError(
                err,
                t("groupSettings.group.logo.removed.error", "Could not save settings"),
              );
            }
          }
        : undefined,
    };
  }
  function kioskEventURL() {
    return Router.url("kioskEvents", {}, { query: { group: group._id } });
  }
  function timetableURL() {
    return Router.url("timetable", {}, { query: { group: group._id } });
  }
  function scheduleURL() {
    return Router.url("frameSchedule", {}, { query: { group: group._id } });
  }
  function frameEventsURL() {
    return Router.url("frameEvents", {}, { query: { group: group._id } });
  }
  function frameWeekURL() {
    return Router.url("frameWeek", {}, { query: { group: group._id } });
  }
  function frameCalendarURL() {
    return Router.url("frameCalendar", {}, { query: { group: group._id } });
  }
  function frameListURL() {
    return Router.url("frameCourselist", {}, { query: { group: group._id } });
  }

  function deleteConfirmAttr() {
    return {
      confirmText: t(
        "group.reallydelete",
        "Please confirm that you would like to delete {GROUP}. This cannot be undone.",
        { GROUP: group.name },
      ),
      confirmButton: t("group.delete.confirm.button", "Delete {GROUP}", { GROUP: group.name }),
      onRemove: async () => {
        const groupId = group._id;
        await GroupsMethods.remove(groupId);

        Alert.success(t("group.deleted", "Group has been deleted"));
      },
      busyButton: t("group.delete.confirm.button.busy", "Deleting group…"),
    };
  }

  async function handleMemberRemove(memberId: string, memberName: string) {
    try {
      await GroupsMethods.updateMembership(memberId, group._id, false);
      Alert.success(
        t("groupSettings.memberRemoved", '"{MEMBER}" has been removed from the "{GROUP}" group', {
          MEMBER: memberName,
          GROUP: group.name,
        }),
      );
    } catch (err) {
      Alert.serverError(err, t("groupSettings.memberRemoved.error", "Could not remove member"));
    }
  }

  async function handleMemberAdd(user: UserModel) {
    try {
      await GroupsMethods.updateMembership(user._id, group._id, true);
      Alert.success(
        t("groupSettings.memberAdded", '"{MEMBER}" has been added to the "{GROUP}" group', {
          MEMBER: user.getDisplayName(),
          GROUP: group.name,
        }),
      );
    } catch (err) {
      Alert.serverError(err, t("groupSettings.memberAdded.error", "Could not add member"));
    }
  }

  async function handleMemberToggleNotify() {
    try {
      await GroupsMethods.toggleMemberNotify(group._id);
    } catch (err) {
      Alert.serverError(
        err,
        t("groupSettings.memberToggleNotify.error", "Could not change members notify setting."),
      );
    }
  }

  return (
    <form>
      <div className="details-form group-settings">
        <div className="row">
          <div className="col-md">
            <h3>
              <i className="fa-solid fa-gear fa-fw" /> {t("group.settings.title", "Settings")}
            </h3>
            <div className="mb-3">
              <label className="form-label">{t("group.settings.field.logo", "Logo")}</label>
              <EditableImage {...logoFileUploadArgs()} />
            </div>
          </div>

          <div className="col-md">
            <h3>
              <i className="fa-solid fa-users fa-fw" />{" "}
              {t("group.settings.title.Members", "Members")}
            </h3>
            <div className="tag-group multiline">
              {group.members.map((member) => (
               <div key={member.user} className="group-member-unit"> 
                  <RemoveMember {...member} onRemove={handleMemberRemove} />

                  {currentUser?._id === member.user &&
                    (member.notify ? (
                      <div className="tag tag-btn group-member-tag-notify addon">
                        <button
                          type="button"
                          title={t(
                            "group.settings.member.turnNotifyOff",
                            "Turn my notifications off",
                          )}
                          onClick={handleMemberToggleNotify}
                        >
                          <i className="fa-solid fa-bell fa-fw" />
                        </button>
                      </div>
                    ) : (
                      <div className="tag tag-btn group-member-tag-notify addon">
                        <button
                          type="button"
                          title={t(
                            "group.settings.member.turnNotifyOn",
                            "Turn my notifications on",
                          )}
                          onClick={handleMemberToggleNotify}
                        >
                          <i className="fa-solid fa-bell-slash fa-fw" />
                        </button>
                      </div>
                    ))}

                  <div className="tag tag-link group-member-tag-profile addon">
                    <a
                      href={Router.path("userprofile", { _id: member.user })}
                      title={t("group.settings.member.profile", "Visit profile")}
                    >
                      <i className="fa-solid fa-user fa-fw" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <FormControl
                id="group-settings-members-search"
                type="text"
                label={t("group.settings.field.addMembers", "Add a new member to your group")}
                prepend="fa-solid fa-user fa-fw"
                placeholder={t("group.settings.field.addMember.placeholder", "Type name of buddy")}
                value={userSearch}
                onChange={(value) => setUserSearch(value)}
              />
            </div>
            {!!userSearch && (
              <div className="tag-group multiline">
                <FoundUsers group={group} userSearch={userSearch} onAdd={handleMemberAdd} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="details-addition">
        <h3>
          <i className="fa-solid fa-link fa-fw" />{" "}
          {t("group.linksCollection.title", "{NAME}-views", { NAME: PublicSettings.siteName })}
        </h3>
        <ul className="list-unstyled">
          <li>
            Infoscreen-Link:{" "}
            <a href={kioskEventURL()} target="_blank" rel="noreferrer">
              {kioskEventURL()}
            </a>
          </li>
          <li>
            Timetable-Link:{" "}
            <a href={timetableURL()} target="_blank" rel="noreferrer">
              {timetableURL()}
            </a>
          </li>
          <li>
            Schedule-Link:{" "}
            <a href={scheduleURL()} target="_blank" rel="noreferrer">
              {scheduleURL()}
            </a>
          </li>
          <li>
            iframe-Eventboxes-Link:{" "}
            <a href={frameEventsURL()} target="_blank" rel="noreferrer">
              {frameEventsURL()}
            </a>
          </li>
          <li>
            iframe-weekly-calendar-Link:{" "}
            <a href={frameWeekURL()} target="_blank" rel="noreferrer">
              {frameWeekURL()}
            </a>
          </li>
          <li>
            iframe-calendar-Link:{" "}
            <a href={frameCalendarURL()} target="_blank" rel="noreferrer">
              {frameCalendarURL()}
            </a>
          </li>
          <li>
            iframe-List-Link:{" "}
            <a href={frameListURL()} target="_blank" rel="noreferrer">
              {frameListURL()}
            </a>
          </li>
        </ul>

        {currentUser?.privileged("admin") && (
          <p>
            {!!group.createdby && (
              <>
                <strong>{t("group.settings.createdBy", "Created by")}</strong>:{" "}
                <ProfileLink userId={group.createdby} />
                <br />
              </>
            )}
            {!!group.time_created && (
              <>
                <strong>{t("group.settings.timeCreated", "Created at")}</strong>:{" "}
                {calendarDayFormat(group.time_created)}
                <br />
              </>
            )}

            {!!group.time_lastedit && (
              <>
                <strong>{t("group.settings.timeLastEdit", "Last edit at")}</strong>:{" "}
                {calendarDayFormat(group.time_lastedit)}
              </>
            )}
          </p>
        )}
      </div>

      {group.editableBy(currentUser) && (
        <div className="actions">
          <DeleteConfirm {...deleteConfirmAttr()} />
        </div>
      )}
    </form>
  );
}
