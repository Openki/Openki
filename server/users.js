
Accounts.onCreateUser(function(options, user) {
	if (options.profile) {
		user.profile = options.profile;
	} else {
		user.profile = {}
	}
	// Collect info where a username could possibly be found
	var name_providers = [user, user.profile];
	if (user.services) name_providers = name_providers.concat(_.toArray(user.services));

	// Try to glean a username
	var name = false;
	var username = false;
	var provider = false;
	while(provider = name_providers.pop()) {
		if (!name && provider.name) name = provider.name;
		if (!username && provider.username) username = provider.username;
	}

	// We're not picky and try assigning a name no questions asked
	user.username = username || name;
	user.profile.name = name || username;

	//tmpfix, all users must have file upload permissions for the events they created ...
	if(!user.privileges){
		user.privileges = Array( 'upload' );
	}
	// puting facebooks emailadress into our email field
	if (user.services && user.services.facebook && user.services.facebook.email){
		user.emails = [{'address': user.services.facebook.email, "verified": true}];
	}
	return user;
});

Accounts.config({
	sendVerificationEmail: true
});


Accounts.emailTemplates.verifyEmail.subject = function(user) {
	return mf('enrollAccount.subject',
		{
			SITE: Accounts.emailTemplates.siteName,
			NAME: user.name
		},
		"Welcome to the {SITE} community, {NAME}"
	);
}

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
		+ "You can click on {URL} to verify your email address. \n"
		+ "This helps us knowing you're a real person. :)\n"
		+ "\n"
		+ "Sincerely\n"
		+ "Your ever so faithful {SITE} living on a virtual chip in a server farm (it's cold here)"
	);
}