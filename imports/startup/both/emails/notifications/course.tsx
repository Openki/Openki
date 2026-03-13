import React from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { truncate } from "lodash-es";

import { Courses } from "/imports/api/courses/courses";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Log } from "/imports/api/log/log";
import { Users, UserModel } from "/imports/api/users/users";
import { Model as NotificationModel } from "../notification";
import { Course, Props } from "/imports/emails/notifications/Course";

import { getSiteName } from "/imports/utils/getSiteName";

interface Body {
  courseId: string;
  recipients: string[];
  model: string;
}

/**
 * Record the intent to send join notifications
 * @param courseId ID for the CourseDiscussions collection
 */
export async function record(courseId: string) {
  check(courseId, String);

  const course = await Courses.findOneAsync(courseId);
  if (!course) {
    throw new Meteor.Error(`No course entry for ${courseId}`);
  }

  const body: Body = {
    courseId: course._id,
    recipients: [course.createdby],
    model: "Course",
  };

  await Log.record("Notification.Send", [course._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const course = await Courses.findOneAsync(body.courseId);
  if (!course) {
    throw new Error("Course does not exist (0.o)");
  }

  const creator = await Users.findOneAsync(course.createdby);
  if (!creator) {
    throw new Error("Creator does not exist (0.o)");
  }

  return {
    accepted(actualRecipient: UserModel) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }
    },

    async vars(locale: string, _actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "courseNotify";

      const subjectvars = {
        COURSE: truncate(course.name, { length: 10 }),
      };

      const subject = t("notification.course.mail.subject", "Your proposed {COURSE}", subjectvars);

      let region: RegionModel | undefined;
      if (course.region) {
        region = await Regions.findOneAsync(course.region);
      }
      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const courseLink = Router.url("showCourse", course, { query: { campaign } });
      return {
        course: <a href={courseLink}>{course.name}</a>,
        courseLink,
        courseDescription: course.description || "",
        creator,
        subject,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Course {...props} />,
  };
}
