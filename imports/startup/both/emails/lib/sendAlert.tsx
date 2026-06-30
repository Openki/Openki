import { Email } from "meteor/email";
import React, { ReactNode } from "react";
import { Version } from "/imports/api/version/version";
import { Alert } from "/imports/emails/Alert";
import { Root } from "/imports/emails/Root";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { renderToEmail } from "/imports/utils/renderToEmail";
import { toEmailLogo } from "/imports/utils/toEmailLogo";

export async function sendAlert(subject: string, text: ReactNode) {
  const version = await Version.findOneAsync();

  const { siteName } = Accounts.emailTemplates;
  const subjectPrefix = `[${siteName}] `;

  const message = await renderToEmail(
    <Root subject={subject} logo={await toEmailLogo(PublicSettings.emailLogo)}>
      <Alert version={version}>
        <p>{text}</p>
      </Alert>
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
}
