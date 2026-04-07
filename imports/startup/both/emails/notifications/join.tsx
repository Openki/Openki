import React from "react";
import { Match, check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { truncate, capitalize } from "lodash-es";

import { Groups } from "../../../../api/groups/groups";
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
 * @param groupId ID for the GroupDiscussions collection
 * @param participantId ID of the user that joined
 * @param newRole new role of the participant
 * @param message Optional message of the new participant
 */
export async function record(
  groupId: string,
  participantId: string,
  newRole: string,
  message?: string,
) {
  check(groupId, String);
  check(participantId, String);
  check(newRole, String);
  check(message, Match.Optional(String));

  const group = await Groups.findOneAsync(groupId);
  if (!group) {
    throw new Meteor.Error(`No group entry for ${groupId}`);
  }

  const participant = await Users.findOneAsync(participantId);
  if (!participant) {
    throw new Meteor.Error(`No user entry for ${participantId}`);
  }

  const body: Body = {
    courseId: group._id,
    participantId: participant._id,
    newRole,
    message,

    // Don't send to new member, they know
    recipients: group
      .membersWithRole("team")
      .map((m) => m.user)
      .filter((r) => r !== participantId),
    model: "Join",
  };

  await Log.record("Notification.Send", [group._id, participant._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const group = await Groups.findOneAsync(body.courseId);
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
      if (!group) {
        throw new Error("Group does not exist (0.o)");
      }

      const roleTitle = t(`roles.${body.newRole}.short`);
      const subjectvars = {
        COURSE: truncate(group.name, { length: 10 }),
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
        .filter((role) => group.roles.includes(role))
        .map((role) => ({
          role: capitalize(t(`roles.${role}.short`)),
          count: group.membersWithRole(role).length,
        }));

      let region: RegionModel | undefined;
      if (group.region) {
        region = await Regions.findOneAsync(group.region);
      }
      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const groupLink = Router.url("showCourse", group, { query: { campaign } });
      return {
        group: <a href={groupLink}>{group.name}</a>,
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
