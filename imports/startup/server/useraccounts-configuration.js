import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';

import * as usersMethods from '/imports/api/users/methods';

import { isEmail } from '/imports/utils/email-tools';

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
