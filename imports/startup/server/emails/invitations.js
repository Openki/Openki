import juice from 'juice';
import { Meteor } from 'meteor/meteor';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Router } from 'meteor/iron:router';

import { Invitations } from '/imports/api/invitations/invitations';
import { Tenants } from '/imports/api/tenants/tenants';
import { Users } from '/imports/api/users/users';
import { Log } from '/imports/api/log/log';

import { base64PngImageData } from '/imports/utils/base64-png-image-data';
import { PublicSettings } from '/imports/utils/PublicSettings';
import { getLocalisedValue } from '/imports/utils/getLocalisedValue';
import { PrivateSettings } from '/imports/utils/PrivateSettings';

/**
 * @param {import('/imports/api/invitations/invitations').InvitationEntity} invitation
 */
function sendInvitation(invitation) {
	const tenant = Tenants.findOne(invitation.tenant);
	if (!tenant) {
		throw new Error('Tenant does not exist (0.o)');
	}

	const inviter = Users.findOne(invitation.createdBy);
	if (!inviter) {
		throw new Error('Inviter does not exist (0.o)');
	}

	const recipient = Users.findOne({ 'emails.0.address': invitation.to }) || {};

	const locale = recipient.locale || inviter.locale || 'en';

	const { siteName } = Accounts.emailTemplates;

	const subjectPrefix = `[${siteName}] `;

	const subject = `Invitation to ${tenant.name}`;

	let message = SSR.render('invitationEmail', {
		subject,
		site: {
			url: Meteor.absoluteUrl(),
			logo: base64PngImageData(PublicSettings.emailLogo),
			name: siteName,
		},
		tenant,
		inviter,
		recipient,
		invitationLink: Router.url('invitation', invitation, {
			query: `tenant=${invitation.tenant}&campaign=invitationEmail`,
		}),
		moreLink: getLocalisedValue(PublicSettings.aboutLink, locale),
		reportEmail: PrivateSettings.reporter.recipient,
		locale,
	});

	// Template can't handle DOCTYPE header, so we add the thing here.
	const DOCTYPE =
		'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
	message = DOCTYPE + message;

	const email = {
		from: Accounts.emailTemplates.from,
		to: invitation.to,
		subject: subjectPrefix + subject,
		html: juice(message),
	};

	Email.send(email);
}

/**
 * @param {import('/imports/api/invitations/invitations').InvitationEntity} invitation
 */
function handleInvitation(invitation) {
	const result = Log.record(
		'Invitation.Send',
		[invitation.createdBy, invitation.tenant],
		invitation,
	); // For traceability
	try {
		sendInvitation(invitation);

		Invitations.update(invitation._id, { $set: { status: 'send' } });
		result.success();
	} catch (e) {
		try {
			Invitations.update(invitation._id, { $set: { status: 'failed' } });
		} finally {
			result.error(e);
		}
	}
}

// Watch for new invitations
Meteor.startup(() => {
	SSR.compileTemplate('invitationEmail', Assets.getText('emails/invitation.html'));

	Invitations.find({ status: 'created' }).observe({
		added: handleInvitation,
		changed: handleInvitation,
	});
});
