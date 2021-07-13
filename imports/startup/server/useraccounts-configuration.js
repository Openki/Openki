import { SSR } from 'meteor/meteorhacks:ssr';
import { mf } from 'meteor/msgfmt:core';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';
import juice from 'juice';

import * as usersMethods from '/imports/api/users/methods';

import { isEmail, getReportEmails } from '/imports/utils/email-tools';
import { base64PngImageData } from '/imports/utils/base64-png-image-data';

Meteor.startup(() => {
	const serviceConf = Meteor.settings.service;
	if (serviceConf) {
		if (serviceConf.google) {
			ServiceConfiguration.configurations.remove({
				service: 'google',
			});
			ServiceConfiguration.configurations.insert({
				service: 'google',
				loginStyle: 'popup',
				clientId: serviceConf.google.clientId,
				secret: serviceConf.google.secret,
			});
		}
		if (serviceConf.facebook) {
			ServiceConfiguration.configurations.remove({
				service: 'facebook',
			});
			ServiceConfiguration.configurations.insert({
				service: 'facebook',
				loginStyle: 'popup',
				appId: serviceConf.facebook.appId,
				secret: serviceConf.facebook.secret,
			});
		}
		if (serviceConf.github) {
			ServiceConfiguration.configurations.remove({
				service: 'github',
			});
			ServiceConfiguration.configurations.insert({
				service: 'github',
				loginStyle: 'popup',
				clientId: serviceConf.github.clientId,
				secret: serviceConf.github.secret,
			});
		}
	}
});

Accounts.validateNewUser((user) => {
	if (user.emails) {
		const email = user.emails[0].address;

		if (!isEmail(email)) {
			throw new Meteor.Error(403, 'email invalid');
		}
	}

	return true;
});

Accounts.onCreateUser((options, originalUser) => {
	const user = { ...originalUser };
	if (options.profile) {
		user.profile = options.profile;
	} else {
		user.profile = {};
	}
	// Collect info where a username could possibly be found
	let nameProviders = [user, user.profile];
	if (user.services) {
		nameProviders = nameProviders.concat(_.toArray(user.services));
	}

	// Try to glean a username
	let name = false;
	let username = false;
	let provider = false;
	/* eslint-disable-next-line no-cond-assign */
	while ((provider = nameProviders.pop()) !== undefined) {
		if (!name && provider.name) {
			name = provider.name;
		}
		if (!username && provider.username) {
			username = provider.username;
		}
	}

	// We're not picky and try assigning a name no questions asked
	user.username = username || name;
	user.profile.name = name || username;

	if (!user.privileges) {
		user.privileges = [];
	}

	// Read email-address if provided
	let providedEmail = false;
	let verified = true; // Assume verified unless there is a flag that says it's not
	const services = user.services;
	if (services) {
		['facebook', 'google', 'github'].forEach((loginProvider) => {
			const provided = services[loginProvider];
			if (provided?.email) {
				providedEmail = provided.email;
				if (typeof provided.verified_email === 'boolean') {
					verified = provided.verified_email;
				}
			}
		});
	}

	if (providedEmail) {
		user.emails = [{ address: providedEmail, verified }];
	}

	user.tenants = [];

	user.groups = [];
	user.badges = [user._id];

	user.notifications = true;
	user.allowPrivateMessages = true;

	return user;
});

Accounts.onLogin(() => {
	const user = Meteor.user();

	// generate a avatar color for every new user
	if (user && user.avatar?.color === undefined) {
		usersMethods.updateAvatarColor();
	}
});

Accounts.config({
	sendVerificationEmail: true,
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
	{ REPORTEMAIL: getReportEmails().recipient },
)}`;
};

Accounts.emailTemplates.verifyEmail.html = function (user, url) {
	return juice(
		SSR.render('userVerifyEmailMail', {
			subject: Accounts.emailTemplates.verifyEmail.subject(user),
			siteName: Accounts.emailTemplates.siteName,
			site: {
				url: Meteor.absoluteUrl(),
				logo: base64PngImageData(Meteor.settings.public.mailLogo),
				name: Accounts.emailTemplates.siteName,
			},
			username: user.username,
			url,
			reportEmail: getReportEmails().recipient,
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
	{ REPORTEMAIL: getReportEmails().recipient },
)}`;
};

Accounts.emailTemplates.resetPassword.html = function (user, url) {
	return juice(
		SSR.render('userResetPasswordMail', {
			subject: Accounts.emailTemplates.resetPassword.subject(user),
			siteName: Accounts.emailTemplates.siteName,
			site: {
				url: Meteor.absoluteUrl(),
				logo: base64PngImageData(Meteor.settings.public.mailLogo),
				name: Accounts.emailTemplates.siteName,
			},
			username: user.username,
			url,
			reportEmail: getReportEmails().recipient,
		}),
	);
};
