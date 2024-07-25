import React from "react";
import { Match, check } from "meteor/check";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";

import { Courses } from "/imports/api/courses/courses";
import { Log } from "/imports/api/log/log";
import { UserModel, Users } from "/imports/api/users/users";
import { RegionModel, Regions } from "/imports/api/regions/regions";
import { Events } from "/imports/api/events/events";

import * as HtmlTools from "/imports/utils/html-tools";
import * as StringTools from "/imports/utils/string-tools";
import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";
import { getSiteName } from "/imports/utils/getSiteName";
import { Model as NotificationModel } from "../notification";
import { PrivateMessage, Props } from "../../../../emails/notifications/PrivateMessage";
import { LocalTime } from "/imports/utils/local-time";

interface Body {
  message: string;
  sender: string;
  recipients: string[];
  targetRecipient: string;
  revealSenderAddress: boolean;
  model: string;
  context: {
    course?: string;
    event?: string;
  };
}

/**
 * Record the intent to send a private message
 * @param senderId id of the user that sends the message
 * @param recipientId id of the intended recipient
 * @param message the message to transmit
 * @param revealSenderAddress include email-address of sender in message
 * @param sendCopyToSender send a copy of the message to the author
 * @param context dictionary with context ID (course, venue, &c.)
 */
export function record(
  senderId: string,
  recipientId: string,
  message: string,
  revealSenderAddress: boolean,
  sendCopyToSender: boolean,
  context: { course?: string; event?: string },
) {
  check(senderId, String);
  check(recipientId, String);
  check(message, String);
  check(revealSenderAddress, Boolean);
  check(sendCopyToSender, Boolean);
  check(context, {
    course: Match.Optional(String),
    event: Match.Optional(String),
  });

  const recipients = [recipientId];
  if (sendCopyToSender) {
    const sender = Users.findOne(senderId);
    if (!sender) {
      throw new Meteor.Error(404, "Sender not found");
    }

    if (sender.hasEmail()) {
      recipients.push(senderId);
    } else {
      throw new Meteor.Error(404, "Sender has no email address");
    }
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

  Log.record("Notification.Send", rel, body);
}

export function Model(entry: { body: Body }): NotificationModel<Props> {
  const { body } = entry;
  const sender = Users.findOne(body.sender);
  const targetRecipient = Users.findOne(body.targetRecipient);

  return {
    accepted(actualRecipient: UserModel) {
      if (
        !actualRecipient.allowPrivateMessages &&
        !UserPrivilegeUtils.privileged(sender, "admin")
      ) {
        throw new Error("User wishes to not receive private messages from users");
      }

      if (!actualRecipient.hasEmail()) {
        throw new Error("Recipient has no email address registered");
      }
    },

    vars(locale: string, actualRecipient: UserModel, unsubToken: string) {
      const t = i18next.getFixedT(locale);
      const campaign = "privateMessage";

      if (!sender) {
        throw new Error("Sender does not exist (0.o)");
      }
      if (!targetRecipient) {
        throw new Error("targetRecipient does not exist (0.o)");
      }

      const subjectvars = {
        SENDER: StringTools.truncate(sender.getDisplayName(), 10),
      };
      const subject = t(
        "notification.privateMessage.mail.subject",
        "Private message from {SENDER}",
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
        fromAddress: "",
        course: undefined as React.JSX.Element | undefined,
        event: undefined as React.JSX.Element | undefined,
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

      const courseContextId = body.context.course;
      if (courseContextId) {
        const course = Courses.findOne(courseContextId);
        if (!course) {
          throw new Meteor.Error(404, "course not found");
        }
        const courseLink = Router.url("showCourse", course, {
          query: { campaign },
        });
        vars.course = <a href={courseLink}>{course.name}</a>;

        regionId = course.region;
      }

      const eventContextId = body.context.event;
      if (eventContextId) {
        const event = Events.findOne(eventContextId);
        if (!event) {
          throw new Meteor.Error(404, "event not found");
        }

        // Show dates in local time and in users locale
        const regionZone = LocalTime.zone(event.region);
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
        region = Regions.findOne(regionId);
      }

      vars.customEmailLogo = region?.custom?.emailLogo;
      vars.customSiteName = getSiteName(region);

      return vars;
    },
    template: (props) => <PrivateMessage {...props} />,
  };
}
