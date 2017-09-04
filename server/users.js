Accounts.onCreateUser(function(options, user) {
	if (options.profile) {
		user.profile = options.profile;
	} else {
		user.profile = {};
	}
	// Collect info where a username could possibly be found
	var name_providers = [user, user.profile];
	if (user.services) name_providers = name_providers.concat(_.toArray(user.services));

	// Try to glean a username
	var name = false;
	var username = false;
	var provider = false;
	while ((provider = name_providers.pop()) !== undefined) {
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
	var providedEmail = false;
	var verified = true; // Assume verified unless there is a flag that says it's not
	let services = user.services;
	if (services) {
		for (let provider of ['facebook', 'google', 'github']) {
			let provided = services[provider];
			if (provided && provided.email) {
				providedEmail = provided.email;
				if (typeof provided.verified_email === "boolean") {
					verified = provided.verified_email;
				}
			}
		}
	}

	if (providedEmail) {
		user.emails = [{ 'address': providedEmail, 'verified': verified }];
	}

	user.groups = [];
	user.badges = [user._id];

	user.notifications = true;

	Meteor.defer(() => {
		Profile.updateAcceptsMessages(user._id);
	});

	return user;
});


Accounts.config({
	sendVerificationEmail: true
});


Accounts.emailTemplates.verifyEmail.subject = function(user) {
	return mf('verifyEmail.subject',
		{
			SITE: Accounts.emailTemplates.siteName,
			NAME: user.name
		},
		"Welcome to the {SITE} community, {NAME}"
	);
};

Accounts.emailTemplates.verifyEmail.text = function(user, url) {
	return mf('verifyEmail.text',
		{
			SITE: Accounts.emailTemplates.siteName,
			NAME: user.username,
			URL: url
		},
		"Hi {NAME}\n"
		+ "\n"
		+ "We're happy that you are part of the {SITE} community.\n"
		+ "\n"
		+ "You can click this link \n"
		+ "{URL}\n"
		+ "to verify your email address. \n"
		+ "This helps us knowing you're a real person. :)\n"
		+ "\n"
		+ "Sincerely\n"
		+ "Your ever so faithful {SITE} living on a virtual chip in a server farm (it's cold here)"
	);
};

Accounts.emailTemplates.resetPassword.subject = function(user) {
	return mf('resetPassword.subject',
		{
			SITE: Accounts.emailTemplates.siteName,
		},
		"Reset your password on {SITE}"
	);
};

Accounts.urls.resetPassword = function(token) {
	return Meteor.absoluteUrl('reset-password/' + token);
};

Accounts.emailTemplates.resetPassword.text = function(user, url) {
	return mf('resetPassword.text',
		{
			SITE: Accounts.emailTemplates.siteName,
			NAME: user.username,
			URL: url
		},
		"Hi {NAME}\n"
		+ "\n"
		+ "You requested to reset your password on {SITE}.\n"
		+ "\n"
		+ "You can click on \n"
		+ "{URL}\n"
		+ "to reset your password. \n"
		+ "If you did not request this message, you can safely delete it.\n"
		+ "\n"
		+ "Regards\n"
		+ "{SITE} server at your service"
	);
};