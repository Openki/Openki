import { Meteor } from "meteor/meteor";
import React from "react";
import { Accounts } from "meteor/accounts-base";
import { Email } from "meteor/email";
import { Random } from "meteor/random";
import { Match, check } from "meteor/check";
import { runBackgroundTasks } from "/imports/utils/background-tasks";
import { Model, Notification } from "../../both/emails/notification";

import { PrivateSettings } from "../../../utils/PrivateSettings";
import { Log } from "/imports/api/log/log";
import { LogEntity } from "/imports/api/log/factory";
import { Users } from "/imports/api/users/users";

import { renderToEmail } from "../../../utils/renderToEmail";
import { Root } from "../../../emails/Root";

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

function mapToObject<T>(map: [string, T][]) {
  return Object.fromEntries(new Map(map).entries());
}

/**
 * Handle event notification
 * @param entry Notification.Event log entry to process
 */
async function send(
  entry: LogEntity & {
    body: { model: string; recipients: string[] };
  },
) {
  // Find out for which recipients sending has already been attempted.
  const concluded = mapToObject(
    await Log.find({
      tr: "Notification.SendResult",
      rel: entry._id,
    }).mapAsync((result) => [(result.body as { recipient: string }).recipient, true]),
  );

  const model = await (
    Notification as {
      [name: string]: {
        Model<T>(_entry: unknown): Promise<Model<T>>;
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

        record(entry, unsubToken, true, recipientId, mail, "success");
      } catch (e) {
        let reason = e;
        if (typeof e === "object" && "toJSON" in e) {
          reason = e.toJSON();
        }
        record(entry, unsubToken, false, recipientId, mail, reason);
      }
    }
  });
}

// Watch the Log for event notifications
if (runBackgroundTasks)
  Meteor.startup(() => {
    // To avoid sending stale notifications, only consider records added in the
    // last hours. This way, if the server should have failed for a longer time,
    // no notifications will go out.
    const gracePeriod = new Date();
    gracePeriod.setHours(gracePeriod.getHours() - 72);

    // The Log is append-only so we only watch for additions
    Log.find({ tr: "Notification.Send", ts: { $gte: gracePeriod } }).observe({
      added: send,
    });
  });
