import React, { useState } from "react";
import { intersection } from "lodash-es";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useViewportSize } from "../../lib/useViewportSize";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import * as Alert from "/imports/api/alerts/alert";
import { GroupModel } from "../../../api/groups/groups";
import * as GroupsMethods from "../../../api/groups/methods";
import { Regions } from "/imports/api/regions/regions";

import * as Analytics from "/imports/ui/lib/analytics";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { MetaTags } from "/imports/ui/components/MetaTags";

import { ButtonDelete, ButtonEdit } from "../../components/Buttons";
import { Discussion } from "../../components/groups/discussion";
import { Edit } from "../../components/groups/edit";
import { mayShare } from "../../components/groups/edit/mayShare";
import { Events } from "../../components/groups/events";
import { Members } from "../../components/groups/members";
import { Roles } from "../../components/groups/roles";
import { Sharing } from "../../components/sharing";
import { ButtonGroupArchive } from "./button-course-archive";
import { ButtonGroupUnarchive } from "./button-course-unarchive";
import { ConfirmDialog } from "./confirm-dialog";
import { Header } from "./header";
import { Submenu } from "./submenu";
import { ActionResult } from "/imports/ui/components/ActionResult";
import { Report } from "/imports/ui/components/report";

import "./styles.scss";

export interface Props {
  edit: boolean;
  group: GroupModel;
  select: string;
}

export function GroupDetailsPage({ edit, group, select }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const viewport = useViewportSize();
  const searchParams = useSearchParams();
  const [isBusy, setIsBusy] = useState(false);

  const [expanded, setExpanded] = useState(false);

  function mayEdit(group: GroupModel) {
    return group?.editableBy(user);
  }

  function groupStateClasses(group: GroupModel) {
    const classes = [];

    if (group?.nextEvent) {
      classes.push("has-upcoming-events");
    } else if (group?.lastEvent) {
      classes.push("has-past-events");
    } else {
      classes.push("is-proposal");
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
        t("courseDetailsPage.message.courseHasBeenDeleted", "{COURSE} was deleted.", {
          COURSE: group.name,
        }),
      );

      let role;
      if (intersection(user?.badges || [], group.editors).length > 0) {
        role = "team";
      } else if (user?.privileged("admin")) {
        role = "admin";
      } else {
        role = "unknown";
      }

      Analytics.trackEvent(
        "Course deletions",
        `Course deletions as ${role}`,
        Regions.findOne(group.region)?.nameEn,
      );

      Router.go("home");
    } catch (err) {
      Alert.serverError(
        err,
        t("courseDetailsPage.message.courseHasBeenDeleted.error", "Removing went wrong"),
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
        t("courseDetailsPage.message.courseHasBeenArchived", "{COURSE} was archived.", {
          COURSE: group.name,
        }),
      );
    } catch (err) {
      Alert.serverError(
        err,
        t("courseDetailsPage.message.courseHasBeenArchived.error", "Archiving went wrong"),
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
        t("courseDetailsPage.message.courseHasBeenUnarchived", "{COURSE} has been unarchived.", {
          COURSE: group.name,
        }),
      );
    } catch (err) {
      Alert.serverError(
        err,
        t("courseDetailsPage.message.courseHasBeenUnarchived.error", "Unarchiving went wrong"),
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
    } = { edit: "course" };
    const force = searchParams.force;
    if (force) {
      query.force = force;
    }
    Router.go("showCourse", group, { query });
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
          title={t("message.courseCreated", "{NAME} has been created", {
            NAME: group.name,
          })}
          actions={[
            group.description
              ? {
                  text: t("message.courseCreated.addDescription", "Add a description"),
                  href: "#course-description",
                }
              : undefined,
            {
              text: t("message.courseCreated.addImage", "Add an image"),
              href: "#files-tab",
            },
            mayShare(group)
              ? { text: t("message.courseCreated.share", "Invite your friends"), href: "#share" }
              : undefined,
            {
              text: t("message.courseCreated.addEvent", "Create event"),
              href: "#course-event-add",
            },
          ]}
        >
          {t("message.courseCreated.description", "What do you wannt to do next?")}
        </ActionResult>
      )}
      <div data-test="course-details" className="container">
        <div className="row course-page g-3">
          <div className="col-lg-8">
            <div className="page-component">
              {group.archived && (
                <div className="alert alert-archived text-center" role="alert">
                  <strong>
                    {t("course.archive.alert", "{COURSE} is archived and not active anymore.", {
                      COURSE: group.name,
                    })}
                  </strong>
                </div>
              )}

              {edit ? (
                <Edit {...group} />
              ) : (
                <>
                  <div className={`course-details ${groupStateClasses(group)}`}>
                    <Header group={group} />
                    <Submenu group={group} />
                  </div>

                  {mayShare(group) && (
                    <div className="p-3 sharing-wrapper text-end" id="share">
                      <h4>
                        {t("sharing.title", "Invite your friends")} <Sharing />
                      </h4>
                    </div>
                  )}

                  {mayEdit(group) && (
                    <>
                      <div className="actions">
                        {!expanded && (
                          <ButtonEdit
                            id="course-details-edit"
                            disabled={isBusy}
                            onClick={handleOnEdit}
                          />
                        )}

                        {group.archived && (
                          <ButtonGroupUnarchive
                            disabled={isBusy}
                            onUnarchive={async () => handleUnarchive()}
                          />
                        )}

                        {!expanded && !group.archived && (
                          <ButtonGroupArchive
                            disabled={isBusy}
                            className="btn-archive"
                            onArchive={async () => handleOnArchive()}
                          >
                            {t("course.archive.archiveButton.archive", "Archive")}
                          </ButtonGroupArchive>
                        )}

                        {!expanded && (
                          <ButtonDelete
                            id="course-details-confirm-delete"
                            onClick={async () => setExpanded(true)}
                          />
                        )}
                      </div>

                      {expanded && (
                        <ConfirmDialog
                          archiveButton={!group.archived}
                          disabled={isBusy}
                          group={group}
                          onArchive={async () => handleOnArchive()}
                          onDelete={handleOnDelete}
                          onCancel={() => setExpanded(false)}
                        />
                      )}
                    </>
                  )}

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
              <Report showGroupHint={true} />
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
