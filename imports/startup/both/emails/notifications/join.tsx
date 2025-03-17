import React from "react";
import { Match, check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { capitalize, truncate } from "lodash";

import { Courses } from "/imports/api/courses/courses";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Log } from "/imports/api/log/log";
import { UserModel, Users } from "/imports/api/users/users";

import * as HtmlTools from "/imports/utils/html-tools";
import { getSiteName } from "/imports/utils/getSiteName";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { Model as NotificationModel } from "../notification";
import { Join, Props } from "/imports/emails/notifications/Join";

interface Body {
  courseId: string;
  participantId: string;
  recipients: string[];
  newRole: string;
  message: string | undefined;
  model: string;
}

/**
 * Record the intent to send join notifications
 * @param courseId ID for the CourseDiscussions collection
 * @param participantId ID of the user that joined
 * @param newRole new role of the participant
 * @param message Optional message of the new participant
 */
export async function record(
  courseId: string,
  participantId: string,
  newRole: string,
  message?: string,
) {
  check(courseId, String);
  check(participantId, String);
  check(newRole, String);
  check(message, Match.Optional(String));

  const course = await Courses.findOneAsync(courseId);
  if (!course) {
    throw new Meteor.Error(`No course entry for ${courseId}`);
  }

  const participant = await Users.findOneAsync(participantId);
  if (!participant) {
    throw new Meteor.Error(`No user entry for ${participantId}`);
  }

  const body: Body = {
    courseId: course._id,
    participantId: participant._id,
    newRole,
    message,

    // Don't send to new member, they know
    recipients: course
      .membersWithRole("team")
      .map((m) => m.user)
      .filter((r) => r !== participantId),
    model: "Join",
  };

  await Log.record("Notification.Send", [course._id, participant._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const course = await Courses.findOneAsync(body.courseId);
  const newParticipant = await Users.findOneAsync(body.participantId);
  const recipients = await Users.find({
    _id: { $in: body.recipients.filter((r) => r !== body.participantId) },
    notifications: true,
  }).fetchAsync();

  return {
    accepted(actualRecipient: UserModel) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }
    },

    async vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "joinNotify";

      if (!newParticipant) {
        throw new Error("New participant does not exist (0.o)");
      }
      if (!course) {
        throw new Error("Course does not exist (0.o)");
      }

      const roleTitle = t(`roles.${body.newRole}.short`);
      const subjectvars = {
        COURSE: truncate(course.name, { length: 10 }),
        USER: truncate(newParticipant.getDisplayName(), { length: 50 }),
        ROLE: roleTitle,
        ROLETYPE: body.newRole,
      };

      const subject = t(
        "notification.join.mail.subject",
        "{USER} joined {COURSE}: {ROLE}",
        subjectvars,
      );

      const figures = ["host", "mentor", "participant", "team"]
        .filter((role) => course.roles.includes(role))
        .map((role) => ({
          role: capitalize(t(`roles.${role}.short`)),
          count: course.membersWithRole(role).length,
        }));

      let region: RegionModel | undefined;
      if (course.region) {
        region = await Regions.findOneAsync(course.region);
      }
      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const courseLink = Router.url("showCourse", course, { query: { campaign } });
      return {
        course: <a href={courseLink}>{course.name}</a>,
        newParticipant: <strong>{newParticipant.getDisplayName()}</strong>,
        subject,
        roleTitle,
        roleType: body.newRole,
        email: <span style={{ color: "blue" }}>{PrivateSettings.siteEmail}</span>,
        message: body.message ? HtmlTools.plainToHtml(body.message) : undefined,
        // For Team members when a mentor joins, add a hint for possible collaboration or
        // invite into team
        appendCollaborationHint: body.newRole === "mentor",
        figures,
        otherRecipients: recipients
          .filter((r) => r._id !== actualRecipient._id)
          .map((r) => r.getDisplayName())
          .join(", "),
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Join {...props} />,
  };
}
