import { SSR } from 'meteor/meteorhacks:ssr';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
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
	return i18n('verifyEmail.subject', '[{SITE}] Welcome to the {SITE} community, {NAME}', {
		SITE: Accounts.emailTemplates.siteName,
		NAME: user.username,
	});
};

Accounts.emailTemplates.verifyEmail.text = function (user, url) {
	return `${i18n('verifyEmail.email.gretting', { NAME: user.username })}
	
${i18n('verifyEmail.email.introduction', {
	SITE: Accounts.emailTemplates.siteName,
})}

${i18n('verifyEmail.email.verification')}
${url}

${i18n('verifyEmail.email.farewell')}
${i18n('verifyEmail.email.postscript', { SITE: Accounts.emailTemplates.siteName })}

${i18n('verifyEmail.email.unexpected', { REPORTEMAIL: PrivateSettings.reporter.recipient })}`;
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
	return i18n('resetPassword.subject', '[{SITE}] Reset your password on {SITE}', {
		SITE: Accounts.emailTemplates.siteName,
	});
};

Accounts.urls.resetPassword = function (token) {
	return Meteor.absoluteUrl(`reset-password/${token}`);
};

Accounts.emailTemplates.resetPassword.text = function (user, url) {
	return `${i18n('resetPassword.email.gretting', { NAME: user.username })}
				
${i18n('resetPassword.email.introduction', {
	SITE: Accounts.emailTemplates.siteName,
})}

${i18n('resetPassword.email.verification')}
${url}

${i18n('resetPassword.email.farewell')}
${i18n('resetPassword.email.postscript', {
	SITE: Accounts.emailTemplates.siteName,
})}

${i18n('resetPassword.email.unexpected', { REPORTEMAIL: PrivateSettings.reporter.recipient })}`;
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
