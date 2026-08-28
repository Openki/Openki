import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useUser, useUserId } from "/imports/utils/react-meteor-data";
import { useTracker } from "meteor/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import {
  OrganizationModel,
  Organizations,
  OrganizationMember,
} from "/imports/api/organizations/organizations";
import * as OrganizationsMethods from "/imports/api/organizations/methods";
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
}: OrganizationMember & { onRemove: (memberId: string, memberName: string) => void }) {
  const { t } = useTranslation();
  const userName = useTracker(() => getUserName(user));
  const currentUserId = useUserId();

  return (
    <div className="tag tag-btn organization-member-tag-btn-remove ">
      <button
        type="button"
        title={t("organizations.settings.removeMember", "remove member")}
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
  organization,
  userSearch,
  onAdd,
}: {
  organization: OrganizationModel;
  userSearch: string;
  onAdd: (user: UserModel) => void;
}) {
  const { t } = useTranslation();

  const [isLoading, users] = useFindFilter(userSearch, {
    exclude: organization.members.map((m) => m.user),
  });

  if (isLoading()) {
    return null;
  }

  return (
    <>
      {users.map((user) => (
        <div key={user._id} className="tag-group-addon-unit">
          <div className="tag tag-btn organization-member-tag-btn-add ">
            <button
              title={t("organizations.settings.addMember", "add as member")}
              type="button"
              onClick={() => onAdd(user)}
            >
              <i className="fa-solid fa-plus fa-fw" /> {user.username}
            </button>
          </div>
          <div className="tag tag-link organization-member-tag-profile addon">
            <a
              href={Router.path("userprofile", user)}
              title={t("organizations.settings.member.profile")}
            >
              <i className="fa-solid fa-user fa-fw" />
            </a>
          </div>
        </div>
      ))}
    </>
  );
}

export interface Props {
  organization: OrganizationModel;
}

export function OrganizationSettings({ organization }: Props) {
  const { t } = useTranslation();
  const currentUser = useUser();
  const { calendarDayFormat } = useDateTimeFormat();
  const [userSearch, setUserSearch] = useState("");

  function logoFileUploadArgs(): EditableImageProps {
    return {
      thumbnail: { src: organization?.publicLogoUrl?.(), maxSize: 150 },
      maxSize: 600, // scale the image to max width/height. Note: image scaling also happens on the server
      async onUpload(file: UploadImage) {
        const organizationId = organization._id;
        try {
          await OrganizationsMethods.updateLogo(organizationId, file);
          const organizationName = Organizations.findOne(organizationId)?.name;
          Alert.success(
            t(
              "organizations.settings.logo.updated.success",
              'Changes to the "{ORGANIZATION}" organization settings have been saved.',
              { ORGANIZATION: organizationName },
            ),
          );
        } catch (err) {
          Alert.serverError(
            err,
            t("organizations.settings.logo.updated.error", "Could not save settings"),
          );
        }
      },
      onDelete: organization?.logoUrl
        ? async function () {
            const organizationId = organization._id;
            try {
              await OrganizationsMethods.deleteLogo(organizationId);
              const organizationName = Organizations.findOne(organizationId)?.name;
              Alert.success(
                t(
                  "organizations.settings.organization.logo.removed",
                  'Changes to the "{ORGANIZATION}" organization settings have been saved.',
                  { ORGANIZATION: organizationName },
                ),
              );
            } catch (err) {
              Alert.serverError(
                err,
                t("organizations.settings.logo.removed.error", "Could not save settings"),
              );
            }
          }
        : undefined,
    };
  }
  function kioskEventURL() {
    return Router.url("kioskEvents", {}, { query: { organization: organization._id } });
  }
  function timetableURL() {
    return Router.url("timetable", {}, { query: { organization: organization._id } });
  }
  function scheduleURL() {
    return Router.url("frameSchedule", {}, { query: { organization: organization._id } });
  }
  function frameEventsURL() {
    return Router.url("frameEvents", {}, { query: { organization: organization._id } });
  }
  function frameWeekURL() {
    return Router.url("frameWeek", {}, { query: { organization: organization._id } });
  }
  function frameCalendarURL() {
    return Router.url("frameCalendar", {}, { query: { organization: organization._id } });
  }
  function frameListURL() {
    return Router.url("frameGroupList", {}, { query: { organization: organization._id } });
  }

  function deleteConfirmAttr() {
    return {
      confirmText: t(
        "organizations.settings.reallyDelete",
        "Please confirm that you would like to delete {ORGANIZATION}. This cannot be undone.",
        { ORGANIZATION: organization.name },
      ),
      confirmButton: t("organizations.settings.delete.confirm.button", "Delete {ORGANIZATION}", {
        ORGANIZATION: organization.name,
      }),
      onRemove: async () => {
        const organizationId = organization._id;
        await OrganizationsMethods.remove(organizationId);

        Alert.success(t("organizations.settings.deleted", "Organization has been deleted"));
      },
      busyButton: t("organizations.settings.delete.confirm.button.busy", "Deleting organization…"),
    };
  }

  async function handleMemberRemove(memberId: string, memberName: string) {
    try {
      await OrganizationsMethods.updateMembership(memberId, organization._id, false);
      Alert.success(
        t(
          "organizations.settings.memberRemoved",
          '"{MEMBER}" has been removed from the "{ORGANIZATION}" organization',
          {
            MEMBER: memberName,
            ORGANIZATION: organization.name,
          },
        ),
      );
    } catch (err) {
      Alert.serverError(
        err,
        t("organizations.settings.memberRemoved.error", "Could not remove member"),
      );
    }
  }

  async function handleMemberAdd(user: UserModel) {
    try {
      await OrganizationsMethods.updateMembership(user._id, organization._id, true);
      Alert.success(
        t(
          "organizations.settings.memberAdded",
          '"{MEMBER}" has been added to the "{ORGANIZATION}" organization',
          {
            MEMBER: user.getDisplayName(),
            ORGANIZATION: organization.name,
          },
        ),
      );
    } catch (err) {
      Alert.serverError(err, t("organizations.settings.memberAdded.error", "Could not add member"));
    }
  }

  async function handleMemberToggleNotify() {
    try {
      await OrganizationsMethods.toggleMemberNotify(organization._id);
    } catch (err) {
      Alert.serverError(
        err,
        t(
          "organizations.settings.memberToggleNotify.error",
          "Could not change members notify setting.",
        ),
      );
    }
  }

  return (
    <form>
      <div className="details-form">
        <div className="row">
          <div className="col-md">
            <h3>
              <i className="fa-solid fa-gear fa-fw" />{" "}
              {t("organizations.settings.title", "Settings")}
            </h3>
            <div className="mb-3">
              <label className="form-label">{t("organizations.settings.field.logo", "Logo")}</label>
              <EditableImage {...logoFileUploadArgs()} />
            </div>
          </div>

          <div className="col-md">
            <h3>
              <i className="fa-solid fa-users fa-fw" />{" "}
              {t("organizations.settings.title.Members", "Members")}
            </h3>
            <div className="tag-group multiline">
              {organization.members.map((member) => (
                <div key={member.user} className="tag-group-addon-unit">
                  <RemoveMember {...member} onRemove={handleMemberRemove} />

                  {currentUser?._id === member.user &&
                    (member.notify ? (
                      <div className="tag tag-btn organization-member-tag-notify addon">
                        <button
                          type="button"
                          title={t(
                            "organizations.settings.member.turnNotifyOff",
                            "Turn my notifications off",
                          )}
                          onClick={handleMemberToggleNotify}
                        >
                          <i className="fa-solid fa-bell fa-fw" />
                        </button>
                      </div>
                    ) : (
                      <div className="tag tag-btn organization-member-tag-notify addon">
                        <button
                          type="button"
                          title={t(
                            "organization.settings.member.turnNotifyOn",
                            "Turn my notifications on",
                          )}
                          onClick={handleMemberToggleNotify}
                        >
                          <i className="fa-solid fa-bell-slash fa-fw" />
                        </button>
                      </div>
                    ))}

                  <div className="tag tag-link organization-member-tag-profile addon">
                    <a
                      href={Router.path("userprofile", { _id: member.user })}
                      title={t("organizations.settings.member.profile", "Visit profile")}
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
                label={t(
                  "organizations.settings.field.addMembers",
                  "Add a new member to your organization",
                )}
                prepend="fa-solid fa-user fa-fw"
                placeholder={t(
                  "organizations.settings.field.addMember.placeholder",
                  "Type name of buddy",
                )}
                value={userSearch}
                onChange={(value) => setUserSearch(value)}
              />
            </div>
            {!!userSearch && (
              <div className="tag-group multiline">
                <FoundUsers
                  organization={organization}
                  userSearch={userSearch}
                  onAdd={handleMemberAdd}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="details-addition">
        <h3>
          <i className="fa-solid fa-link fa-fw" />{" "}
          {t("organizations.settings.linksCollection.title", "{NAME}-views", {
            NAME: PublicSettings.siteName,
          })}
        </h3>
        <p className="organization-id-display">
          <span className="fw-bold">
            {t("organization.settings.organizationId", "Organization ID")}
          </span>
          : <code>{organization._id}</code>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary organization-id-display__copy-btn"
            onClick={() => navigator.clipboard.writeText(organization._id)}
            title={t("organization.settings.copyId", "Copy ID")}
          >
            <i className="fa-solid fa-copy fa-fw" />
          </button>
        </p>
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

        {organization.editableBy(currentUser) && (
          <p>
            {!!organization.createdby && (
              <>
                <span className="fw-bold">
                  {t("organizations.settings.createdBy", "Created by")}
                </span>
                : <ProfileLink userId={organization.createdby} />
                <br />
              </>
            )}
            {!!organization.time_created && (
              <>
                <span className="fw-bold">
                  {t("organizations.settings.timeCreated", "Created at")}
                </span>
                : {calendarDayFormat(organization.time_created)}
                <br />
              </>
            )}

            {!!organization.time_lastedit && (
              <>
                <span className="fw-bold">
                  {t("organizations.settings.timeLastEdit", "Last edit at")}
                </span>
                : {calendarDayFormat(organization.time_lastedit)}
              </>
            )}
          </p>
        )}
      </div>

      {organization.editableBy(currentUser) && (
        <div className="actions">
          <DeleteConfirm {...deleteConfirmAttr()} />
        </div>
      )}
    </form>
  );
}
