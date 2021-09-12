import { SSR } from 'meteor/meteorhacks:ssr';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { Accounts } from 'meteor/accounts-base';
import juice from 'juice';

import { base64PngImageData } from '/imports/utils/base64-png-image-data';
import { PublicSettings } from '/imports/utils/PublicSettings';
import { PrivateSettings } from '/imports/utils/PrivateSettings';

if (PrivateSettings.siteEmail) {
	Accounts.emailTemplates.from = PrivateSettings.siteEmail;
}

Accounts.emailTemplates.siteName = PublicSettings.siteName;

Meteor.startup(() => {
	SSR.compileTemplate('userVerifyEmail', Assets.getText('emails/users/verify.html'));
	SSR.compileTemplate('userResetPasswordEmail', Assets.getText('emails/users/resetPassword.html'));
});

Accounts.emailTemplates.verifyEmail.subject = function (user) {
	return mf(
		'verifyEmail.subject',
		{ SITE: Accounts.emailTemplates.siteName, NAME: user.username },
		'[{SITE}] Welcome to the {SITE} community, {NAME}',
	);
};

Accounts.emailTemplates.verifyEmail.text = function (user, url) {
	return `${mf('verifyEmail.email.gretting', 'Hi {NAME}', { NAME: user.username })}
	
${mf('verifyEmail.email.introduction', "We're happy that you are part of the {SITE} community.", {
	SITE: Accounts.emailTemplates.siteName,
})}

${mf(
	'verifyEmail.email.verification',
	"You can click this link to verify your email address. This helps us knowing you're a real person. :)",
)}
${url}

${mf('verifyEmail.email.farewell', 'Sincerely')}
${mf(
	'verifyEmail.email.postscript',
	"Your ever so faithful {SITE} living on a virtual chip in a server farm (it's cold here)",
	{ SITE: Accounts.emailTemplates.siteName },
)}

${mf(
	'verifyEmail.email.unexpected',
	"If you don't know why you got this mail, ignore it or send us a notification to: {REPORTEMAIL}",
	{ REPORTEMAIL: PrivateSettings.reporter.recipient },
)}`;
};

Accounts.emailTemplates.verifyEmail.html = function (user, url) {
	return juice(
		SSR.render('userVerifyEmail', {
			subject: Accounts.emailTemplates.verifyEmail.subject(user),
			siteName: Accounts.emailTemplates.siteName,
			site: {
				url: Meteor.absoluteUrl(),
				logo: base64PngImageData(PublicSettings.emailLogo),
				name: Accounts.emailTemplates.siteName,
			},
			username: user.username,
			url,
			reportEmail: PrivateSettings.reporter.recipient,
		}),
	);
};

Accounts.emailTemplates.resetPassword.subject = function () {
	return mf(
		'resetPassword.subject',
		{ SITE: Accounts.emailTemplates.siteName },
		'[{SITE}] Reset your password on {SITE}',
	);
};

Accounts.urls.resetPassword = function (token) {
	return Meteor.absoluteUrl(`reset-password/${token}`);
};

Accounts.emailTemplates.resetPassword.text = function (user, url) {
	return `${mf('resetPassword.email.gretting', { NAME: user.username }, 'Hi {NAME}')}
				
${mf(
	'resetPassword.email.introduction',
	{ SITE: Accounts.emailTemplates.siteName },
	'You requested to reset your password on {SITE}.',
)}

${mf(
	'resetPassword.email.verification',
	'You can click on this link to reset your password. If you did not request this message, you can safely delete it.',
)}
${url}

${mf('resetPassword.email.farewell', 'Regards')}
${mf(
	'resetPassword.email.postscript',
	{ SITE: Accounts.emailTemplates.siteName },
	'{SITE} server at your service',
)}

${mf(
	'resetPassword.email.unexpected',
	"If you don't know why you got this mail, ignore it or send us a notification to: {REPORTEMAIL}",
	{ REPORTEMAIL: PrivateSettings.reporter.recipient },
)}`;
};

Accounts.emailTemplates.resetPassword.html = function (user, url) {
	return juice(
		SSR.render('userResetPasswordEmail', {
			subject: Accounts.emailTemplates.resetPassword.subject(user),
			siteName: Accounts.emailTemplates.siteName,
			site: {
				url: Meteor.absoluteUrl(),
				logo: base64PngImageData(PublicSettings.emailLogo),
				name: Accounts.emailTemplates.siteName,
			},
			username: user.username,
			url,
			reportEmail: PrivateSettings.reporter.recipient,
		}),
	);
};
