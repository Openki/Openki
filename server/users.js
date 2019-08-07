import IsEmail from '/imports/utils/email-tools';

Accounts.onCreateUser((options, originalUser) => {
	const user = Object.assign({}, originalUser);
	if (options.profile) {
		user.profile = options.profile;
	} else {
		user.profile = {};
	}
	// Collect info where a username could possibly be found
	let nameProviders = [user, user.profile];
	if (user.services) nameProviders = nameProviders.concat(_.toArray(user.services));

	// Try to glean a username
	let name = false;
	let username = false;
	let provider = false;
	/* eslint-disable-next-line no-cond-assign */
	while ((provider = nameProviders.pop()) !== undefined) {
		if (!name && provider.name) name = provider.name;
		if (!username && provider.username) username = provider.username;
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
			if (provided && provided.email) {
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

	user.groups = [];
	user.badges = [user._id];

	user.notifications = true;

	return user;
});

Accounts.validateNewUser((user) => {
	if (user.emails) {
		const email = user.emails[0].address;

		if (!IsEmail(email)) {
			throw new Meteor.Error(403, 'email invalid');
		}
	}

	return true;
});


Accounts.config({
	sendVerificationEmail: true,
});

Accounts.emailTemplates.verifyEmail.subject = function (user) {
	return mf('verifyEmail.subject',
		{
			SITE: Accounts.emailTemplates.siteName,
			NAME: user.name,
		},
		'[{SITE}] Welcome to the {SITE} community, {NAME}');
};

Accounts.emailTemplates.verifyEmail.text = function (user, url) {
	return mf('verifyEmail.text',
		{
			SITE: Accounts.emailTemplates.siteName,
			NAME: user.username,
			URL: url,
		},
		'Hi {NAME}\n'
		+ '\n'
		+ "We're happy that you are part of the {SITE} community.\n"
		+ '\n'
		+ 'You can click this link \n'
		+ '{URL}\n'
		+ 'to verify your email address. \n'
		+ "This helps us knowing you're a real person. :)\n"
		+ '\n'
		+ 'Sincerely\n'
		+ "Your ever so faithful {SITE} living on a virtual chip in a server farm (it's cold here)");
};

Accounts.emailTemplates.resetPassword.subject = function () {
	return mf('resetPassword.subject',
		{
			SITE: Accounts.emailTemplates.siteName,
		},
		'Reset your password on {SITE}');
};

Accounts.urls.resetPassword = function (token) {
	return Meteor.absoluteUrl(`reset-password/${token}`);
};

Accounts.emailTemplates.resetPassword.text = function (user, url) {
	return mf('resetPassword.text',
		{
			SITE: Accounts.emailTemplates.siteName,
			NAME: user.username,
			URL: url,
		},
		'Hi {NAME}\n'
		+ '\n'
		+ 'You requested to reset your password on {SITE}.\n'
		+ '\n'
		+ 'You can click on \n'
		+ '{URL}\n'
		+ 'to reset your password. \n'
		+ 'If you did not request this message, you can safely delete it.\n'
		+ '\n'
		+ 'Regards\n'
		+ '{SITE} server at your service');
};
