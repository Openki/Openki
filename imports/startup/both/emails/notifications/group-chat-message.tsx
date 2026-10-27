import React from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { truncate } from "lodash-es";
import i18next from "i18next";

import { GroupModel, Groups } from "../../../../api/groups/groups";
import { RegionModel, Regions } from "../../../../api/regions/regions";
import { UserModel, Users } from "../../../../api/users/users";
import { Log } from "../../../../api/log/log";

import { getSiteName } from "../../../../utils/getSiteName";
import { Model as NotificationModel } from "../notification";
import { Comment, Props } from "../../../../emails/notifications/GroupChatMessage";
import { getUniqueValues } from "/imports/utils/getUniqueValues";
import { GroupChatMessages } from "/imports/api/group-chat-messages/group-chat-messages";

export const ModelName = "GroupChatMessage";

export interface Body {
  messageId: string;
  recipients: string[];
  model: typeof ModelName;
}

/**
 * Record the intent to send event notifications
 * @param messageId ID for the GroupChatMessage collection
 */
export async function record(messageId: string) {
  check(messageId, String);
  const message = await GroupChatMessages.findOneAsync(messageId);
  if (!message) {
    throw new Meteor.Error(`No GroupChatMessage entry for ${messageId}`);
  }

  const group = await Groups.findOneAsync(message.groupId);
  if (!group) {
    throw new Meteor.Error(`No group entry for ${messageId}`);
  }

  const role = group.roles.find((groupRole) => groupRole.id === message.roleId);
  if (!role) {
    throw new Error(`Expected role to exist in group: ${message.roleId}`);
  }
  let recipients = group.getGroupChatParticipants(role).map((m) => m.user);

  // Don't send to the user who sent the message
  if (message.userId) {
    recipients = recipients.filter((r) => r !== message.userId);
  }

  recipients = getUniqueValues(recipients);

  const body: Body = {
    messageId: message._id,
    recipients,
    model: ModelName,
  };

  await Log.record("Notification.Send", [group._id, message._id], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const message = await GroupChatMessages.findOneAsync(entry.body.messageId);

  let group: GroupModel | undefined;
  let sender: UserModel | undefined;
  let senderName: string | undefined;

  if (message) {
    group = await Groups.findOneAsync(message.groupId);
    if (message.userId) {
      sender = await Users.findOneAsync(message.userId);
    }
    if (sender) {
      senderName = sender.getDisplayName();
    }
  }

  return {
    accepted(actualRecipient) {
      if (actualRecipient.notifications === false) {
        throw new Error("User wishes to not receive automated notifications");
      }
    },

    async vars(locale, _actualRecipient, unsubToken) {
      const t = i18next.getFixedT(locale);
      const campaign = "commentNotify";

      if (!message) {
        throw new Error("Comment does not exist (0.o)");
      }
      if (!group) {
        throw new Error("Group does not exist (0.o)");
      }

      const subjectvars = {
        GROUP: truncate(group.name, { length: 10 }),
        SENDER: "",
        ROLE: message.roleId,
      };

      let subject;
      if (sender) {
        subjectvars.SENDER = truncate(senderName, { length: 20 });
        subject = t(
          "notification.comment.mail.subject",
          "Comment on {GROUP} by {SENDER}: {TITLE}",
          subjectvars,
        );
      } else {
        subject = t(
          "notification.comment.mail.subject.anon",
          "Anonymous comment on {GROUP}: {TITLE}",
          subjectvars,
        );
      }

      let region: RegionModel | undefined;
      if (group.region) {
        region = await Regions.findOneAsync(group.region);
      }
      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);
      const groupLink = Router.url("showGroup", group, {
        query: { campaign },
      });
      const commentLink = Router.url("showGroup", group, {
        query: { select: message._id, campaign },
      });

      return {
        group: <a href={groupLink}>{group.name}</a>,
        commentLink,
        subject,
        comment: message,
        commenter: sender,
        commenterLink: Router.url(
          "userprofile",
          { _id: message.userId, username: senderName },
          { query: { campaign } },
        ),
        commenterName: senderName,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <Comment {...props} />,
  };
}
