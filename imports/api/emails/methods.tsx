import React from "react";
import { Accounts } from "meteor/accounts-base";
import { Match, check } from "meteor/check";
import { Email } from "meteor/email";
import { Meteor } from "meteor/meteor";

import { Version } from "/imports/api/version/version";
import { Users } from "/imports/api/users/users";

import { Notification } from "/imports/notification/notification";
import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { Type } from "/imports/utils/CustomChecks";
import { renderToEmail } from "/imports/utils/renderToEmail";
import { Root } from "../../emails/root";
import { Report } from "../../emails/report";

export const sendVerificationEmail = ServerMethod(
  "sendVerificationEmail",
  () => {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    Accounts.sendVerificationEmail(userId);
  },
  { simulation: false },
);

export const SendPrivateMessageOptionsPattern = {
  revealAddress: Boolean,
  sendCopy: Boolean,
  courseId: Match.Optional(String),
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

    const recipient = await Users.findOneAsync(userId);
    if (!recipient) {
      throw new Meteor.Error(404, "no such user");
    }
    if (!recipient.acceptsPrivateMessages && !UserPrivilegeUtils.privileged(operator, "admin")) {
      throw new Meteor.Error(401, "this user does not accept private messages from users");
    }

    const context: { course?: string; event?: string } = {};
    if (options.courseId) {
      context.course = options.courseId;
    }
    if (options.eventId) {
      context.event = options.eventId;
    }

    Notification.PrivateMessage.record(
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

    const message = renderToEmail(
      <Root subject={subject}>
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

    Email.send(email);
  },
  { simulation: false },
);
