import React from "react";
import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";

import { InvitationEntity, Invitations } from "/imports/api/invitations/invitations";
import { Tenants } from "/imports/api/tenants/tenants";
import { Users } from "/imports/api/users/users";
import { Log } from "/imports/api/log/log";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

import { Invitation } from "/imports/emails/Invitation";
import { Root } from "/imports/emails/Root";
import { renderToEmail } from "/imports/utils/renderToEmail";
import { toEmailLogo } from "/imports/utils/toEmailLogo";

async function sendInvitation(invitation: InvitationEntity) {
  const tenant = await Tenants.findOneAsync(invitation.tenant);
  if (!tenant) {
    throw new Error("Tenant does not exist (0.o)");
  }

  const inviter = await Users.findOneAsync(invitation.createdBy);
  if (!inviter) {
    throw new Error("Inviter does not exist (0.o)");
  }

  const recipient = await Users.findOneAsync({ "emails.0.address": invitation.to });

  const locale = recipient?.locale || inviter.locale || "en";

  const { siteName } = Accounts.emailTemplates;

  const subjectPrefix = `[${siteName}] `;

  const subject = `Invitation to ${tenant.name}`;

  const message = await renderToEmail(
    <Root subject={subject} logo={await toEmailLogo(PublicSettings.emailLogo)}>
      <Invitation
        siteName={siteName}
        tenant={tenant}
        inviter={inviter}
        recipient={recipient}
        invitationLink={Router.url("invitation", invitation, {
          query: { tenant: invitation.tenant, campaign: "invitationEmail" },
        })}
        reportEmail={
          <a href={`mailto:${PrivateSettings.reporter.recipient}`}>
            {PrivateSettings.reporter.recipient}
          </a>
        }
        lng={locale}
      />
    </Root>,
  );

  const email: Email.EmailOptions = {
    from: Accounts.emailTemplates.from,
    replyTo: PrivateSettings.replyToEmail,
    to: invitation.to,
    subject: subjectPrefix + subject,
    html: message,
  };

  await Email.sendAsync(email);
}

async function handleInvitation(invitation: InvitationEntity) {
  const result = await Log.record(
    "Invitation.Send",
    [invitation.createdBy, invitation.tenant],
    invitation,
  ); // For traceability
  try {
    await sendInvitation(invitation);

    await Invitations.updateAsync(invitation._id, { $set: { status: "send" } });
    await result.success();
  } catch (e) {
    try {
      await Invitations.updateAsync(invitation._id, { $set: { status: "failed" } });
    } finally {
      await result.error(e);
    }
  }
}

// Watch for new invitations
if (runBackgroundTasks)
  Meteor.startup(async () => {
    await Invitations.find({ status: "created" }).observeAsync({
      added: handleInvitation,
      changed: handleInvitation,
    });
  });
