import { Meteor } from 'meteor/meteor';

function visibleTenants() {
	let usersTenants = [];

	try {
		// Source: https://forums.meteor.com/t/error-meteor-userid-can-only-be-invoked-in-method-calls-or-publications-in-collection-extends/44650/2
		// Will throw an error unless within method call.
		// Attempt to recover gracefully by catching:
		usersTenants = Meteor.user().tenants || [];

	// eslint-disable-next-line no-empty
	} catch (e) {}

	return usersTenants.concat(Meteor.settings.public.publicTenants);
}

export { visibleTenants as default, visibleTenants };
