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
import { GroupChatMessage, Props } from "../../../../emails/notifications/GroupChatMessage";
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
      const campaign = "groupChatNotify";

      if (!message) {
        throw new Error("Group chat message does not exist (0.o)");
      }
      if (!group) {
        throw new Error("Group does not exist (0.o)");
      }

      // Not ideal to hard code the role like this,
      // but this is OK since we currently only use it for the team role.
      const roleLabel = "Team";

      const subjectvars = {
        GROUP: truncate(group.name, { length: 10 }),
        SENDER: truncate(senderName, { length: 20 }),
        ROLE: roleLabel,
      };

      const subject = t(
        "notification.groupChatMessage.mail.subject",
        "{SENDER} sent a message to the {ROLE} chat in {GROUP}",
        subjectvars,
      );

      let region: RegionModel | undefined;
      if (group.region) {
        region = await Regions.findOneAsync(group.region);
      }
      const customEmailLogo = region?.custom?.emailLogo;
      const customSiteName = getSiteName(region);
      const groupLink = Router.url("showGroup", group, {
        query: { campaign },
      });
      const messageLink = Router.url("showGroup", group, { query: { campaign } });

      return {
        group: <a href={groupLink}>{group.name}</a>,
        role: roleLabel,
        messageLink,
        subject,
        message,
        senderName,
        senderLink: Router.url(
          "userprofile",
          { _id: message.userId, username: senderName },
          { query: { campaign } },
        ),
        customSiteName,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customEmailLogo,
        unsubscribe: { type: "automatedNotifications", token: unsubToken },
        campaign,
      };
    },
    template: (props) => <GroupChatMessage {...props} />,
  };
}
