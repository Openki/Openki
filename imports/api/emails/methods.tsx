import React from "react";
import { Accounts } from "meteor/accounts-base";
import { Match, check } from "meteor/check";
import { Email } from "meteor/email";
import { Meteor } from "meteor/meteor";

import { Version } from "/imports/api/version/version";
import { Users } from "/imports/api/users/users";

import { Notification } from "/imports/startup/both/emails/notification";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { Type } from "/imports/utils/CustomChecks";
import { renderToEmail } from "/imports/utils/renderToEmail";
import { Root } from "/imports/emails/Root";
import { Report } from "/imports/emails/Report";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { toEmailLogo } from "/imports/utils/toEmailLogo";

export const sendVerificationEmail = ServerMethod(
  "sendVerificationEmail",
  async () => {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    await Accounts.sendVerificationEmail(userId);
  },
  { simulation: false },
);

export const SendPrivateMessageOptionsPattern = {
  revealAddress: Boolean,
  sendCopy: Boolean,
  groupId: Match.Optional(String),
  eventId: Match.Optional(String),
};
export type SendPrivateMessageOptions = Type<typeof SendPrivateMessageOptionsPattern>;

export const sendPrivateMessage = ServerMethod(
  "sendEmail",
  async (userId: string, message: string, options: SendPrivateMessageOptions) => {
    check(userId, String);
    check(message, String);
    check(options, SendPrivateMessageOptionsPattern);

    const operator = await Meteor.userAsync();
    if (!operator) {
      throw new Meteor.Error(401, "please log in");
    }

    if (!operator.hasVerifiedEmail()) {
      throw new Meteor.Error(403, "please verify your email");
    }

    const recipient = await Users.findOneAsync(userId);
    if (!recipient) {
      throw new Meteor.Error(404, "no such user");
    }
    if (!recipient.allowPrivateMessages && !operator.hasPrivilige("admin")) {
      throw new Meteor.Error(401, "this user does not accept direct messages from users");
    }

    const context: { group?: string; event?: string } = {};
    if (options.groupId) {
      context.group = options.groupId;
    }
    if (options.eventId) {
      context.event = options.eventId;
    }

    await Notification.PrivateMessage.record(
      operator._id,
      recipient._id,
      message,
      options.revealAddress,
      options.sendCopy,
      context,
    );
  },
);

export const sendReport = ServerMethod(
  "report",
  async (title: string, location: string, userAgent: string, reportMessage: string) => {
    check(title, String);
    check(location, String);
    check(userAgent, String);
    check(reportMessage, String);

    const user = await Meteor.userAsync();

    const version = await Version.findOneAsync();

    const { siteName } = Accounts.emailTemplates;
    const subjectPrefix = `[${siteName}] `;
    const subject = `Report: ${title}`;

    const message = await renderToEmail(
      <Root subject={subject} logo={await toEmailLogo(PublicSettings.emailLogo)}>
        <Report
          user={user}
          version={version}
          location={location}
          title={title}
          report={reportMessage}
          userAgent={userAgent}
        />
      </Root>,
    );

    const reportEmail = PrivateSettings.reporter;

    const email: Email.EmailOptions = {
      from: reportEmail.sender,
      to: reportEmail.recipient,
      subject: subjectPrefix + subject,
      html: message,
    };

    await Email.sendAsync(email);
  },
  { simulation: false },
);
