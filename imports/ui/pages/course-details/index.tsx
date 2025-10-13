import React, { useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { intersection, truncate } from "lodash";
import { textPlain } from "/imports/utils/html-tools";

import * as Alert from "/imports/api/alerts/alert";
import { Regions } from "/imports/api/regions/regions";
import * as CoursesMethods from "/imports/api/courses/methods";
import { CourseModel } from "/imports/api/courses/courses";

import { PleaseLogin } from "/imports/ui/lib/please-login";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as TemplateMixins from "/imports/ui/lib/template-mixins";
import * as Viewport from "/imports/ui/lib/viewport";

import * as Analytics from "/imports/ui/lib/analytics";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";



import "./template.html";
import "./styles.scss";
import { mayShare } from "../../components/courses/edit/mayShare";
import { useTranslation } from "react-i18next";

const Template = TemplateMixins.Expandible(
  TemplateAny as TemplateStaticTyped<
    "courseDetailsPage",
    {
      edit: boolean;
      course: CourseModel;
      member: boolean;
      select: string;
    }
  >,
  "courseDetailsPage",
);

export interface  Props {
      edit: boolean;
      course: CourseModel;
      member: boolean;
      select: string;
    }

const template = Template.courseDetailsPage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    const { course } = Template.currentData();
    Metatags.setCommonTags(
      course.name,
      truncate(textPlain(course.description || ""), { length: 160 }),
      course.publicUrlForDetailsImage(),
    );
  });

  instance.busy(false);
});

template.helpers({
  // more helpers in course.roles.js

  mayEdit(course: CourseModel) {
    return course?.editableBy(Meteor.user());
  },

  mayShare,
  courseStateClasses(course: CourseModel) {
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
  },
  mobileViewport() {
    return Viewport.get().width <= ScssVars.screenMD;
  },
});

template.events({
  async "click .js-delete-course-confirm"(_event, instance) {
    instance.busy("deleting");
    PleaseLogin(instance, async () => {
      const { course } = instance.data;

      try {
        await CoursesMethods.remove(course._id);

        Alert.success(
          i18n("courseDetailsPage.message.courseHasBeenDeleted", "{COURSE} was deleted.", {
            COURSE: course.name,
          }),
        );

        const user = await Meteor.userAsync();
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
          i18n("courseDetailsPage.message.courseHasBeenDeleted.error", "Removing went wrong"),
        );
      } finally {
        instance.busy(false);
      }
    });
  },

  async "click .js-course-archive"(_event, instance) {
    instance.busy("archive");
    PleaseLogin(instance, async () => {
      const { course } = instance.data;
      try {
        await CoursesMethods.archive(course._id);
        instance.collapse();

        Alert.success(
          i18n("courseDetailsPage.message.courseHasBeenArchived", "{COURSE} was archived.", {
            COURSE: course.name,
          }),
        );
      } catch (err) {
        Alert.serverError(
          err,
          i18n("courseDetailsPage.message.courseHasBeenArchived.error", "Archiving went wrong"),
        );
      } finally {
        instance.busy(false);
      }
    });
  },

  async "click .js-course-unarchive"(_event, instance) {
    instance.busy("unarchive");
    PleaseLogin(instance, async () => {
      const { course } = instance.data;
      try {
        await CoursesMethods.unarchive(course._id);

        Alert.success(
          i18n(
            "courseDetailsPage.message.courseHasBeenUnarchived",
            "{COURSE} has been unarchived.",
            { COURSE: course.name },
          ),
        );
      } catch (err) {
        Alert.serverError(
          err,
          i18n("courseDetailsPage.message.courseHasBeenUnarchived.error", "Unarchiving went wrong"),
        );
      } finally {
        instance.busy(false);
      }
    });
  },

  "click .js-course-edit"(_event, instance) {
    instance.collapse();

    const { course } = instance.data;

    const query: {
      edit: string;
      force?: string;
    } = { edit: "course" };
    const force = Router.current().params.query.force;
    if (force) {
      query.force = force;
    }
    Router.go("showCourse", course, { query });
  },
});

export function CourseDetailsPage(data:Props) {
  const { course } = data;
  const { t } = useTranslation();

  useEffect(()=>{

    Metatags.setCommonTags(
      course.name,
      truncate(textPlain(course.description || ""), { length: 160 }),
      course.publicUrlForDetailsImage(),
    );
  })


  return   <div data-test="course-details" className="container">
    <div className="row course-page g-3">
      <div className="col-lg-8">
        <div className="page-component">
          {course.archived && (
            <div
              className="alert alert-archived text-center"
              role="alert"
            >
              <strong>
                {t("course.archive.alert", "{COURSE} is archived and not active anymore.", {
                  COURSE: course.name,
                })}
              </strong>
            </div>
          )}

          {edit ? (
            <CourseEdit course={course} />
          ) : (
            <>
              <div className={`course-details ${courseStateClasses(course)}`}>
                <CourseDetailsHeader course={course} />
                <CourseDetailsSubmenu course={course} />
              </div>

              {mayShare(course) && (
                <div className="p-3 shariff-wrapper text-end" id="share">
                  <h4>{t("sharing.title", "Invite your friends")}</h4>
                  <Sharing />
                </div>
              )}

              {mayEdit(course) && (
                <div className="actions">
                  <ButtonEdit event="js-course-edit" />

                  {course.archived && <ButtonCourseUnarchive />}

                  {!expanded && !course.archived && (
                    <ButtonCourseArchive
                      buttonClassName="btn-archive"
                      textIdle={t("course.archive.archiveButton.archive", "Archive")}
                    />
                  )}

                  {!expanded && <ButtonDelete event="js-expand" />}
                </div>

                  {expanded && (
                    <ConfirmDialog
                      hasArchiveButton={course.archived}
                      course={course}
                    />
                  )}
              )}

              <CourseRoles course={course} />
            </>
          )}
        </div>

        {mobileViewport ? (
          <CourseEvents />
        ) : (
          <Discussion courseId={course._id} select={select} />
        )}
      </div>

      <div className="col-lg-4">
        {!mobileViewport && <CourseEvents />}

        <div className="page-component">
          <CourseMembers course={course} />
        </div>

        {mobileViewport && (
          <Discussion courseId={course._id} select={select} />
        )}

        <div className="page-component mt-3">
          <Report />
        </div>
      </div>
    </div>
  </div>
}
