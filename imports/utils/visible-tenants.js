import { Meteor } from 'meteor/meteor';

function visibleTenants() {
	let usersTenants = [];

	try {
		// Will throw an error unless within method call.
		// Attempt to recover gracefully by catching:
		usersTenants = Meteor.user().tenants || [];

	// eslint-disable-next-line no-empty
	} catch (e) {}

	return usersTenants.concat(Meteor.settings.public.publicTenants);
}

export { visibleTenants as default, visibleTenants };
