import { Meteor } from 'meteor/meteor';
/** @typedef {import('/imports/api/regions/regions').RegionModel} RegionModel */

/** @param {RegionModel} [region] */
export function getSiteName(region) {
	if (region?.custom?.siteName) {
		return region.custom.siteName;
	}

	if (Meteor.settings.public.siteName) {
		return Meteor.settings.public.siteName;
	}

	return 'Hmmm';
}

export default getSiteName;
