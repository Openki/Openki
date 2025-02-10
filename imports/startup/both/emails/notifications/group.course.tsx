import React from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { chain, truncate } from "lodash";

import { Courses } from "/imports/api/courses/courses";
import { Groups } from "/imports/api/groups/groups";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Log } from "/imports/api/log/log";
import { Users, UserModel } from "/imports/api/users/users";
import { Model as NotificationModel } from "../notification";
import { GroupCourse, Props } from "../../../../emails/notifications/GroupCourse";

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

  const recipients = chain(
    Groups.find({ _id: { $in: course.groupOrganizers } }).map((g) => g.members),
  )
    .flatten()
    .filter((m) => m.notify)
    .map((m) => m.user)
    .uniq()
    .value();

  const body: Body = {
    courseId: course._id,

    // Don't send to creater
    recipients: recipients.filter((r) => r !== course.createdby),
    model: "Group.Course",
  };

  await Log.record("Notification.Send", [course._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const course = await Courses.findOneAsync(body.courseId);
  if (!course) {
    throw new Error("Course does not exist (0.o)");
  }
  const groups = await Groups.find({ _id: { $in: course.groupOrganizers } }).fetchAsync();
  if (!(groups.length > 0)) {
    throw new Error("Groups does not exist (0.o)");
  }

  const creater = await Users.findOneAsync(course.createdby);
  if (!creater) {
    throw new Error("Creater does not exist (0.o)");
  }

  return {
    accepted(actualRecipient: UserModel) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }
    },

    async vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "groupCourseNotify";

      const recipientsGroups = groups.filter((g) =>
        g.members.some((m) => m.user === actualRecipient._id),
      );

      const subjectvars = {
        COURSE: truncate(course.name, { length: 10 }),
        GROUPS: truncate(recipientsGroups.map((g) => g.short).join(", "), { length: 30 }),
      };

      const subject = t(
        "notification.group.course.mail.subject",
        "{COURSE} proposed in {GROUPS}",
        subjectvars,
      );

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
        courseDescription: course.description,
        groups: recipientsGroups
          .map((g) => (
            <a
              href={Router.url("groupDetails", g, {
                query: { campaign },
              })}
            >
              {g.name}
            </a>
          ))
          .reduce((prev, curr) => [prev, <>", "</>, curr] as any),
        creater,
        subject,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <GroupCourse {...props} />,
  };
}
