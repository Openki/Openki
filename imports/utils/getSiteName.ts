import { Meteor } from 'meteor/meteor';
import { RegionModel } from '/imports/api/regions/regions';

export function getSiteName(region: RegionModel): string {
	if (region?.custom?.siteName) {
		return region.custom.siteName;
	}

	if (Meteor.settings.public.siteName) {
		return Meteor.settings.public.siteName;
	}

	return 'Hmmm';
}

export default getSiteName;
