import React, { useState } from "react";
import { intersection } from "lodash-es";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useViewportSize } from "../../lib/useViewportSize";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import * as Alert from "/imports/api/alerts/alert";
import { GroupModel } from "/imports/api/groups/groups";
import * as GroupsMethods from "/imports/api/groups/methods";
import { Regions } from "/imports/api/regions/regions";

import * as Analytics from "/imports/ui/lib/analytics";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { MetaTags } from "/imports/ui/components/MetaTags";

import { ButtonDelete, ButtonEdit } from "../../components/Buttons";
import { Discussion } from "../../components/groups/discussion";
import { Edit } from "../../components/groups/edit";
import { Events } from "../../components/groups/events";
import { Members } from "../../components/groups/members";
import { Roles } from "../../components/groups/roles";
import { Sharing } from "../../components/sharing";
import { ArchiveButton } from "./ArchiveButton";
import { UnarchiveButton } from "./UnarchiveButton";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Header } from "./header";
import { Submenu } from "./submenu";
import { ActionResult } from "/imports/ui/components/ActionResult";
import { Report } from "/imports/ui/components/report";
import { GroupCategories } from "/imports/ui/components/groups/categories";

import "./styles.scss";

export interface Props {
  edit: boolean;
  group: GroupModel;
  select: string;
}

function canShare(group: GroupModel) {
  if (group.isPrivate()) {
    return false;
  }

  // only show share a group if there is a role to subscribe
  if (!(
    group.roles.some((r) => r !== "team") ||
    (group.roles.includes("team") && !group.members.some((m) => m.roles.includes("team")))
  )) {
    return false;
  }

  return true;
}

export function GroupDetailsPage({ edit, group, select }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const viewport = useViewportSize();
  const searchParams = useSearchParams();
  const [isBusy, setIsBusy] = useState(false);

  const [expanded, setExpanded] = useState(false);

  function groupStateClasses(group: GroupModel) {
    const classes = [];

    switch (group.hasState()) {
      case "proposal":
        classes.push("is-proposal");
        break;
      case "upcomingEvent":
        classes.push("has-upcoming-events");
        break;
      case "resting":
        classes.push("has-past-events");
        break;
      default:
        throw new Error(`Unexpected value for group state: ${group.hasState()}`);
    }

    if (group?.archived) {
      classes.push("is-archived");
    }

    return classes.join(" ");
  }
  function mobileViewport() {
    return viewport.width <= ScssVars.screenMD;
  }

  async function handleOnDelete() {
    setIsBusy(true);

    try {
      await GroupsMethods.remove(group._id);

      Alert.success(
        t("groupDetailsPage.message.groupHasBeenDeleted", "{GROUP} was deleted.", {
          GROUP: group.name,
        }),
      );

      let role;
      if (intersection(user?.badges || [], group.editors).length > 0) {
        role = "team";
      } else if (user?.hasPrivilige("admin")) {
        role = "admin";
      } else {
        role = "unknown";
      }

      Analytics.trackEvent(
        "Group deletions",
        `Group deletions as ${role}`,
        Regions.findOne(group.region)?.nameEn,
      );

      Router.go("home");
    } catch (err) {
      Alert.serverError(
        err,
        t("groupDetailsPage.message.groupHasBeenDeleted.error", "Removing went wrong"),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleOnArchive() {
    setIsBusy(true);
    try {
      await GroupsMethods.archive(group._id);
      setExpanded(false);

      Alert.success(
        t("groupDetailsPage.message.groupHasBeenArchived", "{GROUP} was archived.", {
          GROUP: group.name,
        }),
      );
    } catch (err) {
      Alert.serverError(
        err,
        t("groupDetailsPage.message.groupHasBeenArchived.error", "Archiving went wrong"),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUnarchive() {
    setIsBusy(true);
    try {
      await GroupsMethods.unarchive(group._id);

      Alert.success(
        t("groupDetailsPage.message.groupHasBeenUnarchived", "{GROUP} has been unarchived.", {
          GROUP: group.name,
        }),
      );
    } catch (err) {
      Alert.serverError(
        err,
        t("groupDetailsPage.message.groupHasBeenUnarchived.error", "Unarchiving went wrong"),
      );
    } finally {
      setIsBusy(false);
    }
  }

  function handleOnEdit() {
    setExpanded(false);

    const query: {
      edit: string;
      force?: string;
    } = { edit: "group" };
    const force = searchParams.force;
    if (force) {
      query.force = force;
    }
    Router.go("showGroup", group, { query });
  }

  return (
    <>
      <MetaTags
        title={group.name}
        description={group.description}
        image={group.publicUrlForDetailsImage()}
      />

      {searchParams.nextActions === "1" && (
        <ActionResult
          type="success"
          dismissible
          title={t("message.groupCreated", "{NAME} has been created", {
            NAME: group.name,
          })}
          actions={[
            group.description
              ? {
                  text: t("message.groupCreated.addDescription", "Add a description"),
                  href: "#group-description",
                }
              : undefined,
            {
              text: t("message.groupCreated.addImage", "Add an image"),
              href: "#files-tab",
            },
            canShare(group)
              ? { text: t("message.groupCreated.share", "Invite your friends"), href: "#share" }
              : undefined,
            {
              text: t("message.groupCreated.addEvent", "Create event"),
              href: "#group-event-add",
            },
          ]}
        >
          {t("message.groupCreated.description", "What do you want to do next?")}
        </ActionResult>
      )}
      <div data-test="group-details" className="container">
        <div className="row group-page g-3">
          <div className="col-lg-8">
            <div className="page-component">
              {group.archived && (
                <div className="alert alert-archived text-center fw-bold" role="alert">
                  {t("group.archive.alert", "{GROUP} is archived and not active anymore.", {
                    GROUP: group.name,
                  })}
                </div>
              )}

              {edit ? (
                <Edit {...group} />
              ) : (
                <>
                  <div className={`group-details ${groupStateClasses(group)}`}>
                    <Header group={group} />
                    <Submenu group={group} />
                  </div>
                  <div className="bottom-panel">
                    {!!group.categories?.length && (
                      <div className="group-details-categories me-auto">
                        <GroupCategories categories={group.categories} />
                      </div>
                    )}

                    {canShare(group) && (
                      <div className="p-3 sharing-wrapper text-end ms-auto" id="share">
                        <h4>
                          {t("sharing.title", "Invite your friends")}{" "}
                          <Sharing url={Router.url("showGroup", group)} />
                        </h4>
                      </div>
                    )}
                  </div>

                  {!!group?.editableBy(user) &&
                    (!expanded ? (
                      <div className="actions">
                        <ButtonEdit
                          id="group-details-edit"
                          disabled={isBusy}
                          onClick={handleOnEdit}
                        />

                        {!group.archived ? (
                          <ArchiveButton
                            disabled={isBusy}
                            className="btn-archive"
                            onArchive={async () => handleOnArchive()}
                          >
                            {t("group.archive.archiveButton.archive", "Archive")}
                          </ArchiveButton>
                        ) : (
                          <UnarchiveButton
                            disabled={isBusy}
                            onUnarchive={async () => handleUnarchive()}
                          />
                        )}

                        <ButtonDelete
                          id="group-details-confirm-delete"
                          onClick={async () => setExpanded(true)}
                          label={
                            group.singleEvent
                              ? t("group.event.edit.deleteEvent", "Delete event")
                              : t("group.delete.button", "Delete group")
                          }
                        />
                      </div>
                    ) : (
                      <DeleteConfirmDialog
                        archiveButton={!group.archived}
                        disabled={isBusy}
                        group={group}
                        onArchive={async () => handleOnArchive()}
                        onDelete={handleOnDelete}
                        onCancel={() => setExpanded(false)}
                      />
                    ))}

                  <Roles group={group} />
                </>
              )}
            </div>

            {mobileViewport() ? (
              <Events group={group} />
            ) : (
              <Discussion groupId={group._id} select={select} />
            )}
          </div>

          <div className="col-lg-4">
            {!mobileViewport() && <Events group={group} />}

            <div className="page-component">
              <Members group={group} />
            </div>

            {mobileViewport() && <Discussion groupId={group._id} select={select} />}

            <div className="page-component mt-3">
              <Report showGroupHint />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// for Blaze
import "./template.html";

Template.registerHelper("GroupDetailsPage", () => GroupDetailsPage);
