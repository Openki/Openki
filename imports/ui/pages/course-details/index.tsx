import React, { useEffect, useState } from "react";
import { intersection, truncate } from "lodash-es";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useViewportSize } from "../../lib/useViewportSize";
import { textPlain } from "/imports/utils/html-tools";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import * as Alert from "/imports/api/alerts/alert";
import { CourseModel } from "/imports/api/courses/courses";
import * as CoursesMethods from "/imports/api/courses/methods";
import { Regions } from "/imports/api/regions/regions";

import * as Analytics from "/imports/ui/lib/analytics";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as Metatags from "/imports/utils/metatags";

import { ButtonDelete, ButtonEdit } from "../../components/Buttons";
import { Discussion } from "../../components/courses/discussion";
import { Edit } from "../../components/courses/edit";
import { mayShare } from "../../components/courses/edit/mayShare";
import { Events } from "../../components/courses/events";
import { Members } from "../../components/courses/members";
import { Roles } from "../../components/courses/roles";
import { Sharing } from "../../components/sharing";
import { ButtonCourseArchive } from "./button-course-archive";
import { ButtonCourseUnarchive } from "./button-course-unarchive";
import { ConfirmDialog } from "./confirm-dialog";
import { Header } from "./header";
import { Submenu } from "./submenu";
import { ActionResult } from "/imports/ui/components/ActionResult";
import { Report } from "/imports/ui/components/report";

import "./styles.scss";

export interface Props {
  edit: boolean;
  course: CourseModel;
  select: string;
}

export function CourseDetailsPage({ edit, course, select }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const viewport = useViewportSize();
  const searchParams = useSearchParams();
  const [isBusy, setIsBusy] = useState(false);

  const [expanded, setExpanded] = useState(false);

  function mayEdit(course: CourseModel) {
    return course?.editableBy(user);
  }

  function courseStateClasses(course: CourseModel) {
    const classes = [];

    if (course?.nextEvent) {
      classes.push("has-upcoming-events");
    } else if (course?.lastEvent) {
      classes.push("has-past-events");
    } else {
      classes.push("is-proposal");
    }

    if (course?.archived) {
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
      await CoursesMethods.remove(course._id);

      Alert.success(
        t("courseDetailsPage.message.courseHasBeenDeleted", "{COURSE} was deleted.", {
          COURSE: course.name,
        }),
      );

      let role;
      if (intersection(user?.badges || [], course.editors).length > 0) {
        role = "team";
      } else if (user?.privileged("admin")) {
        role = "admin";
      } else {
        role = "unknown";
      }

      Analytics.trackEvent(
        "Course deletions",
        `Course deletions as ${role}`,
        Regions.findOne(course.region)?.nameEn,
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
      await CoursesMethods.archive(course._id);
      setExpanded(false);

      Alert.success(
        t("courseDetailsPage.message.courseHasBeenArchived", "{COURSE} was archived.", {
          COURSE: course.name,
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
      await CoursesMethods.unarchive(course._id);

      Alert.success(
        t("courseDetailsPage.message.courseHasBeenUnarchived", "{COURSE} has been unarchived.", {
          COURSE: course.name,
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
    Router.go("showCourse", course, { query });
  }

  useEffect(() => {
    Metatags.setCommonTags(
      course.name,
      truncate(textPlain(course.description || ""), { length: 160 }),
      course.publicUrlForDetailsImage(),
    );
  });

  return (
    <>
      {searchParams.nextActions === "1" && (
        <ActionResult
          type="success"
          dismissible
          title={t("message.courseCreated", "{NAME} has been created", {
            NAME: course.name,
          })}
          actions={[
            course.description
              ? {
                  text: t("message.courseCreated.addDescription", "Add a description"),
                  href: "#course-description",
                }
              : undefined,
            {
              text: t("message.courseCreated.addImage", "Add an image"),
              href: "#files-tab",
            },
            mayShare(course)
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
              {course.archived && (
                <div className="alert alert-archived text-center" role="alert">
                  <strong>
                    {t("course.archive.alert", "{COURSE} is archived and not active anymore.", {
                      COURSE: course.name,
                    })}
                  </strong>
                </div>
              )}

              {edit ? (
                <Edit {...course} />
              ) : (
                <>
                  <div className={`course-details ${courseStateClasses(course)}`}>
                    <Header course={course} />
                    <Submenu course={course} />
                  </div>

                  {mayShare(course) && (
                    <div className="p-3 sharing-wrapper text-end" id="share">
                      <h4>
                        {t("sharing.title", "Invite your friends")} <Sharing />
                      </h4>
                    </div>
                  )}

                  {mayEdit(course) && (
                    <>
                      <div className="actions">
                        {!expanded && (
                          <ButtonEdit
                            id="course-details-edit"
                            disabled={isBusy}
                            onClick={handleOnEdit}
                          />
                        )}

                        {course.archived && (
                          <ButtonCourseUnarchive
                            disabled={isBusy}
                            onUnarchive={async () => handleUnarchive()}
                          />
                        )}

                        {!expanded && !course.archived && (
                          <ButtonCourseArchive
                            disabled={isBusy}
                            className="btn-archive"
                            onArchive={async () => handleOnArchive()}
                          >
                            {t("course.archive.archiveButton.archive", "Archive")}
                          </ButtonCourseArchive>
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
                          archiveButton={!course.archived}
                          disabled={isBusy}
                          course={course}
                          onArchive={async () => handleOnArchive()}
                          onDelete={handleOnDelete}
                          onCancel={() => setExpanded(false)}
                        />
                      )}
                    </>
                  )}

                  <Roles course={course} />
                </>
              )}
            </div>

            {mobileViewport() ? (
              <Events course={course} />
            ) : (
              <Discussion courseId={course._id} select={select} />
            )}
          </div>

          <div className="col-lg-4">
            {!mobileViewport() && <Events course={course} />}

            <div className="page-component">
              <Members course={course} />
            </div>

            {mobileViewport() && <Discussion courseId={course._id} select={select} />}

            <div className="page-component mt-3">
              <Report />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// for Blaze
import "./template.html";
Template.registerHelper("CourseDetailsPage", () => CourseDetailsPage);
