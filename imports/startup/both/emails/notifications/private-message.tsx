import React, { JSX } from "react";
import { Match, check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { chain, truncate } from "lodash-es";

import { Groups } from "/imports/api/groups/groups";
import { Log } from "/imports/api/log/log";
import { UserModel, Users } from "/imports/api/users/users";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Events } from "/imports/api/events/events";

import * as HtmlTools from "/imports/utils/html-tools";
import { getSiteName } from "/imports/utils/getSiteName";
import { Model as NotificationModel } from "../notification";
import { PrivateMessage, Props } from "/imports/emails/notifications/PrivateMessage";
import { LocalTime } from "/imports/utils/local-time";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { sendAlert } from "../lib/sendAlert";

export interface Body {
  message: string;
  sender: string;
  recipients: string[];
  targetRecipient: string;
  revealSenderAddress: boolean;
  model: "PrivateMessage";
  context: {
    group?: string | undefined;
    event?: string | undefined;
  };
}

/**
 * Record the intent to send a private message
 * @param senderId id of the user that sends the message
 * @param recipientId id of the intended recipient
 * @param message the message to transmit
 * @param revealSenderAddress include email-address of sender in message
 * @param sendCopyToSender send a copy of the message to the author
 * @param context dictionary with context ID (group, venue, &c.)
 */
export async function record(
  senderId: string,
  recipientId: string,
  message: string,
  revealSenderAddress: boolean,
  sendCopyToSender: boolean,
  context: { group?: string; event?: string },
) {
  check(senderId, String);
  check(recipientId, String);
  check(message, String);
  check(revealSenderAddress, Boolean);
  check(sendCopyToSender, Boolean);
  check(context, {
    group: Match.Optional(String),
    event: Match.Optional(String),
  });

  const recipients = [recipientId];
  if (sendCopyToSender) {
    const sender = await Users.findOneAsync(senderId);
    if (!sender) {
      throw new Meteor.Error(404, "Sender not found");
    }

    recipients.push(senderId);
  }

  const contextRel = Object.values(context);

  const rel = [senderId, recipientId, ...contextRel].filter((id) => id) as string[];

  const body: Body = {
    message,
    sender: senderId,
    targetRecipient: recipientId,
    revealSenderAddress,
    recipients,
    model: "PrivateMessage",
    context,
  };

  await Log.record("Notification.Send", rel, body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const sender = await Users.findOneAsync(body.sender);
  const targetRecipient = await Users.findOneAsync(body.targetRecipient);

  if (!sender?.hasPrivilege("admin") && PrivateSettings.allowedPrivateMessagesPerHour) {
    // Check how many messages a user has sent and block if there are too many
    const observePeriod = new Date();
    observePeriod.setHours(observePeriod.getHours() - 1);
    const recipient = chain(
      await Log.find({
        tr: "Notification.Send",
        ts: { $gte: observePeriod },
        "body.model": "PrivateMessage",
        "body.sender": body.sender,
      }).fetchAsync(),
    )
      .map((m) => (m.body as { targetRecipient: string }).targetRecipient)
      .uniq()
      .value();

    if (recipient.length === PrivateSettings.allowedPrivateMessagesPerHour + 1) {
      await sendAlert(
        "Alert: A user sent many messages",
        <>
          The User <a href={Router.url("userprofile", sender)}>{sender?.getDisplayName()}</a> sent
          too many messages in a hour. Further messages are not sent to the recipients.
          <br />
          Check if it&apos;s SPAM, and potentially block and remove the user.
          <br />
          If the messages are legitimate, wait for 1h and then remove the
          &quot;Notification.SendResult&quot; entry from the Log in the DB.
        </>,
      );
    }

    if (
      recipient.indexOf(body.targetRecipient) >
      PrivateSettings.allowedPrivateMessagesPerHour - 1
    ) {
      throw new Error(
        "The User sent too many messages in the last hour. The message are not sent to recipients. If the messages were legitimate, remove this 'Notification.SendResult' entry from the Log in the DB.",
      );
    }
  }

  return {
    accepted(actualRecipient: UserModel) {
      if (!actualRecipient.allowPrivateMessages && !sender?.hasPrivilege("admin")) {
        throw new Error("User wishes to not receive private messages from users");
      }
    },

    async vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "privateMessage";

      if (!sender) {
        throw new Error("Sender does not exist (0.o)");
      }
      if (!targetRecipient) {
        throw new Error("targetRecipient does not exist (0.o)");
      }

      const subjectvars = {
        SENDER: truncate(sender.getDisplayName(), { length: 10 }),
      };
      const subject = t(
        "notification.privateMessage.mail.subject",
        "Direct message from {SENDER}",
        subjectvars,
      );
      const htmlizedMessage = HtmlTools.plainToHtml(entry.body.message);

      // Find out whether this is the copy sent to the sender.
      const senderCopy = sender._id === actualRecipient._id;

      const vars = {
        sender,
        senderLink: Router.url("userprofile", sender, { query: { campaign } }),
        subject,
        message: htmlizedMessage,
        senderCopy,
        recipientName: targetRecipient.getDisplayName(),
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: undefined as string | undefined,
        customEmailLogo: undefined as string | undefined,
        shouldShowPMWarning:
          !sender.hasPrivilege("admin") &&
          sender.createdAt.getTime() >= Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days
        fromAddress: "",
        group: undefined as JSX.Element | undefined,
        event: undefined as JSX.Element | undefined,
        unsubscribe: { type: "privateMessage" as const, token: unsubToken },
        campaign,
      };

      if (body.revealSenderAddress) {
        const senderAddress = sender.verifiedEmailAddress();
        if (!senderAddress) {
          throw new Meteor.Error(400, "no verified email address");
        }
        vars.fromAddress = senderAddress;
      }

      let region: RegionModel | undefined;
      let regionId = actualRecipient.profile?.regionId;

      const groupContextId = body.context.group;
      if (groupContextId) {
        const group = await Groups.findOneAsync(groupContextId);
        if (!group) {
          throw new Meteor.Error(404, "group not found");
        }
        const groupLink = Router.url("showGroup", group, {
          query: { campaign },
        });
        vars.group = <a href={groupLink}>{group.name}</a>;

        regionId = group.region;
      }

      const eventContextId = body.context.event;
      if (eventContextId) {
        const event = await Events.findOneAsync(eventContextId);
        if (!event) {
          throw new Meteor.Error(404, "event not found");
        }

        // Show dates in local time and in users locale
        const regionZone = await LocalTime.zoneAsync(event.region);
        const startMoment = regionZone.at(event.start);
        startMoment.locale(locale);

        const title = t("notification.privateMessage.mail.title", "{DATE} — {EVENT}", {
          EVENT: event.title,
          DATE: startMoment.calendar(),
        });
        const eventLink = Router.url("showEvent", event, {
          query: { campaign },
        });
        vars.event = <a href={eventLink}>{title}</a>;

        regionId = event.region;
      }

      if (regionId) {
        region = await Regions.findOneAsync(regionId);
      }

      vars.customEmailLogo = region?.custom?.emailLogo;
      vars.customSiteName = getSiteName(region);

      return vars;
    },
    template: (props) => <PrivateMessage {...props} />,
  };
}
