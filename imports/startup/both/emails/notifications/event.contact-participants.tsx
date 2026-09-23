import React, { JSX } from "react";
import { check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import { truncate } from "lodash-es";

import { Log } from "/imports/api/log/log";
import { UserModel, Users } from "/imports/api/users/users";
import { Regions } from "/imports/api/regions/regions";
import { Events } from "/imports/api/events/events";

import * as HtmlTools from "/imports/utils/html-tools";
import { getSiteName } from "/imports/utils/getSiteName";
import { LocalTime } from "/imports/utils/local-time";
import { Model as NotificationModel } from "../notification";
import {
  EventContactParticipants,
  Props,
} from "/imports/emails/notifications/EventContactParticipants";

export const ModelName = "Event.ContactParticipants";

export interface Body {
  sender: string;
  message: string;
  event: string;
  recipients: string[];
  revealSenderAddress: boolean;
  model: typeof ModelName;
}

/**
 * Record the intent to send a private message
 * @param senderId id of the user that sends the message
 * @param message the message to transmit
 * @param eventId id of the event from where the message was send
 * @param revealSenderAddress include email-address of sender in message
 * @param sendCopyToSender send a copy of the message to the author
 */
export async function record(
  senderId: string,
  message: string,
  eventId: string,
  revealSenderAddress: boolean,
  sendCopyToSender: boolean,
) {
  check(senderId, String);
  check(message, String);
  check(eventId, String);
  check(revealSenderAddress, Boolean);
  check(sendCopyToSender, Boolean);

  const recipients = [];

  const event = await Events.findOneAsync(eventId);
  if (!event) {
    throw new Meteor.Error(`No event for ${eventId}`);
  }

  const participants = event.participants?.map((p) => p.user);

  if (!participants?.length) {
    throw new Meteor.Error(`Event ${eventId} has none participants.`);
  }

  recipients.push(...participants.filter((p) => p !== senderId));

  if (sendCopyToSender) {
    const sender = await Users.findOneAsync(senderId);
    if (!sender) {
      throw new Meteor.Error(404, "Sender not found");
    }

    recipients.push(senderId);
  }

  const body: Body = {
    event: eventId,
    message,
    sender: senderId,
    recipients,
    revealSenderAddress,
    model: ModelName,
  };

  await Log.record("Notification.Send", [senderId, eventId, ...recipients], body);
}

export async function Model(entry: { body: Body }): Promise<NotificationModel<Props>> {
  const { body } = entry;
  const sender = await Users.findOneAsync(body.sender);
  const event = await Events.findOneAsync(body.event);

  return {
    accepted(actualRecipient: UserModel) {
      if (!actualRecipient.notifications) {
        throw new Error("User wishes to not receive automated notifications");
      }
    },

    async vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "eventContactParticipants";

      if (!sender) {
        throw new Error("Sender does not exist (0.o)");
      }
      if (!event) {
        throw new Error("Event does not exist (0.o)");
      }

      const subjectvars = {
        EVENT: truncate(event.title, { length: 50 }),
        SENDER: truncate(sender.getDisplayName(), { length: 10 }),
      };
      const subject = t(
        "notification.event.contact-participants.mail.subject",
        "Message from {SENDER} to all attendees of {EVENT}",
        subjectvars,
      );
      const htmlizedMessage = HtmlTools.plainToHtml(entry.body.message);

      // Find out whether this is the copy sent to the sender.
      const senderCopy = sender._id === actualRecipient._id;

      const region = await Regions.findOneAsync(event.region);

      const emailLogo = region?.custom?.emailLogo;
      const siteName = getSiteName(region);

      const senderUrl = Router.url("userprofile", sender, {
        query: { campaign },
      });

      const vars = {
        sender,
        senderLink: senderUrl,
        senderName: <a href={senderUrl}>{sender.getDisplayName()}</a>,
        subject,
        message: htmlizedMessage,
        senderCopy,
        customSiteUrl: Router.url("home", {}, { query: { campaign } }),
        customSiteName: siteName,
        customEmailLogo: emailLogo,
        fromAddress: "",
        eventTitle: undefined as JSX.Element | undefined,
        unsubscribe: { type: "automatedNotifications" as const, token: unsubToken },
        campaign,
      };

      if (body.revealSenderAddress) {
        const senderAddress = sender.verifiedEmailAddress();
        if (!senderAddress) {
          throw new Meteor.Error(400, "no verified email address");
        }
        vars.fromAddress = senderAddress;
      }

      // Show dates in local time and in users locale
      const regionZone = await LocalTime.zoneAsync(event.region);
      const startMoment = regionZone.at(event.start);
      startMoment.locale(locale);

      const eventFullTitle = t(
        "notification.event.contact-participants.mail.title",
        "{DATE} — {EVENT}",
        {
          EVENT: event.title,
          DATE: startMoment.calendar(),
        },
      );
      const eventUrl = Router.url("showEvent", event, {
        query: { campaign },
      });

      vars.eventTitle = <a href={eventUrl}>{eventFullTitle}</a>;

      return vars;
    },
    template: (props) => <EventContactParticipants {...props} />,
  };
}
