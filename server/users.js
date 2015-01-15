
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

	return user;
});