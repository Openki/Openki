import React from "react";
import { Accounts } from "meteor/accounts-base";
import { Email } from "meteor/email";
import { Random } from "meteor/random";
import { Match, check } from "meteor/check";

import { Log } from "/imports/api/log/log";
import { LogEntity } from "/imports/api/log/factory";
import { UserModel, Users } from "/imports/api/users/users";

import * as event from "./notifications/event";
import * as eventCanceled from "./notifications/event.canceled";
import * as eventReminder from "./notifications/event.reminder";
import * as eventContactParticipants from "./notifications/event.contact-participants";
import * as rsvp from "./notifications/rsvp";
import * as rsvpTeam from "./notifications/rsvp.team";
import * as comment from "./notifications/comment";
import * as join from "./notifications/join";
import * as groupCourse from "./notifications/group.course";
import * as privateMessage from "./notifications/private-message";

import { PrivateSettings } from "../../../utils/PrivateSettings";
import { renderToEmail } from "../../../utils/renderToEmail";
import { Root, Props as RootProps } from "../../../emails/Root";

export const Notification = {
  Event: event,
  "Event.Canceled": eventCanceled,
  "Event.Reminder": eventReminder,
  "Event.ContactParticipants": eventContactParticipants,
  Rsvp: rsvp,
  "Rsvp.Team": rsvpTeam,
  Comment: comment,
  Join: join,
  "Group.Course": groupCourse,
  PrivateMessage: privateMessage,
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SendResult {
  /**
   * Record the result of a notification delivery attempt
   * @param note notification log-entry
   * @param unsubToken token that can be used to unsubscribe from further notices
   * @param sent whether the notification was sent
   * @param recipient recipient user ID
   * @param message generated message (or null if we didn't get that far)
   * @param reason why this log entry was recorded
   */
  export function record(
    note: { _id: string },
    unsubToken: string | null,
    sent: boolean,
    recipient: string,
    message: unknown,
    reason: string,
  ) {
    check(sent, Boolean);
    check(unsubToken, Match.Maybe(String));
    check(recipient, String);
    check(message, Match.Maybe(Object));
    const entry = {
      sent,
      recipient,
      message,
      reason,
      unsubToken,
    };

    const rel = [note._id, recipient];
    if (unsubToken) {
      rel.push(unsubToken);
    }

    Log.record("Notification.SendResult", rel, entry);
  }
}

export type Model<T> = {
  accepted(user: UserModel): void;
  vars(
    locale: string,
    user: UserModel,
    unsubToken: string,
  ): {
    fromAddress?: string | undefined;
  } & RootProps &
    // Remove some props
    Omit<T, "siteName" | "customSiteName" | "username" | "lng">;
  template: (
    props: {
      fromAddress?: string | undefined;
      siteName: string;
      username: string;
      lng: string;
    } & RootProps &
      T,
  ) => React.JSX.Element;
};

/**
 * Handle event notification
 * @param entry Notification.Event log entry to process
 */
export function send(
  entry: LogEntity & { body: comment.Body } & {
    body: { model: string; recipients: string[] };
  },
) {
  // Find out for which recipients sending has already been attempted.
  const concluded: { [recipient: string]: boolean } = {};

  Log.find({
    tr: "Notification.SendResult",
    rel: entry._id,
  })
    .map((r) => r as { body: { recipient: string } })
    .forEach((result) => {
      concluded[result.body.recipient] = true;
    });

  const model = (
    Notification as {
      [name: string]: {
        Model<T>(_entry: unknown): Model<T>;
      };
    }
  )[entry.body.model].Model(entry);

  entry.body.recipients.forEach((recipientId: string) => {
    if (!concluded[recipientId]) {
      let mail: Email.EmailOptions | null = null;
      let unsubToken = null;

      try {
        const user = Users.findOne(recipientId);

        if (!user) {
          throw new Error(`User not found for ID '${recipientId}'`);
        }

        model.accepted(user);

        const address = user.emailAddress();

        const username = user.getDisplayName();
        // use user locale for translation
        const locale = user.locale || "en";

        const { siteName } = Accounts.emailTemplates;
        const subjectPrefix = `[${siteName}] `;

        unsubToken = Random.secret();
        const vars = model.vars(locale, user, unsubToken);

        const message = renderToEmail(
          <Root
            subject={vars.subject}
            customSiteUrl={vars.customSiteUrl}
            customEmailLogo={vars.customEmailLogo}
            customSiteName={vars.customSiteName || siteName}
          >
            {model.template({
              ...vars,
              // For everything that is global use siteName from global settings, eg. unsubscribe
              siteName,
              // For everything context specifig us customSiteName from the region, eg. courses
              customSiteName: vars.customSiteName || siteName,
              username,
              lng: locale,
            })}
          </Root>,
        );

        mail = {
          from: Accounts.emailTemplates.from,
          replyTo: vars.fromAddress || PrivateSettings.replyToEmail,
          to: address || undefined,
          subject: subjectPrefix + vars.subject,
          html: message,
        };

        Email.send(mail);

        SendResult.record(entry, unsubToken, true, recipientId, mail, "success");
      } catch (e) {
        let reason = e;
        if (typeof e === "object" && "toJSON" in e) {
          reason = e.toJSON();
        }
        SendResult.record(entry, unsubToken, false, recipientId, mail, reason);
      }
    }
  });
}
