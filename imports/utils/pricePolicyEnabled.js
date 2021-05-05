import { Meteor } from 'meteor/meteor';

/** @typedef {import('/imports/api/events/events').EventModel} EventModel */
/** @typedef {import('/imports/api/events/events').Geodata} Geodata */

/**
 * Checks if price-policy is enabled for this instance.
 * Its only disabled if you set the pricePolicyEnabled-var
 * explicitly to false.
 */
export function pricePolicyEnabled() {
	const pricePolicySetting = Meteor.settings.public.pricePolicyEnabled;
	if (pricePolicySetting === false) {
		return false;
	}
	// price policy setting is not set, is ambiguos, or is set explicitly to true.
	return true;
}

export default pricePolicyEnabled;
