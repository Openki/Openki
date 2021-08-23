import { Meteor } from 'meteor/meteor';
import { PublicSettings } from './PublicSettings';

export function visibleTenants() {
	let usersTenants: string[];

	try {
		// Source: https://forums.meteor.com/t/error-meteor-userid-can-only-be-invoked-in-method-calls-or-publications-in-collection-extends/44650/2
		// Will throw an error unless within method call.
		// Attempt to recover gracefully by catching:
		usersTenants = Meteor.user()?.tenants?.map((t) => t._id) || [];
	} catch {
		usersTenants = [];
	}

	return usersTenants.concat(PublicSettings.publicTenants);
}

export default visibleTenants;
