import { Accounts } from "meteor/accounts-base";
import { Email } from "meteor/email";
import { Random } from "meteor/random";
import { Match, check } from "meteor/check";

import { Log } from "/imports/api/log/log";
import { LogEntity } from "/imports/api/log/factory";
import { UserModel, Users } from "/imports/api/users/users";

import * as notificationEvent from "/imports/notification/notification.event";
import * as notificationEventCanceled from "/imports/notification/notification.event.canceled";
import * as notificationEventReminder from "/imports/notification/notification.event.reminder";
import * as notificationEventContactParticipants from "/imports/notification/notification.event.contact-participants";
import * as notificationRsvp from "/imports/notification/notification.rsvp";
import * as notificationRsvpTeam from "/imports/notification/notification.rsvp.team";
import * as notificationComment from "/imports/notification/notification.comment";
import * as notificationJoin from "/imports/notification/notification.join";
import * as notificationGroupCourse from "/imports/notification/notification.group.course";
import * as notificationPrivateMessage from "/imports/notification/notification.private-message";

import { PrivateSettings } from "../utils/PrivateSettings";
import { renderToEmail } from "../utils/renderToEmail";
import { Root, Props as RootProps } from "../emails/root";

export const Notification = {
  Event: notificationEvent,
  "Event.Canceled": notificationEventCanceled,
  "Event.Reminder": notificationEventReminder,
  "Event.ContactParticipants": notificationEventContactParticipants,
  Rsvp: notificationRsvp,
  "Rsvp.Team": notificationRsvpTeam,
  Comment: notificationComment,
  Join: notificationJoin,
  "Group.Course": notificationGroupCourse,
  PrivateMessage: notificationPrivateMessage,
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
  entry: LogEntity & { body: notificationComment.Body } & {
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
