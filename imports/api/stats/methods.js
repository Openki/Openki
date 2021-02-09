import { Meteor } from 'meteor/meteor';

import Stats from '/imports/api/stats/stats';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';


Meteor.methods({
	/**
	 * @param {string} regionId
	 */
	'stats.region'(regionId) {
		if (UserPrivilegeUtils.privilegedTo('admin')) {
			const regionFilter = regionId === 'all_regions' ? '' : regionId;
			return Stats.getRegionStats(regionFilter);
		}
		return {};
	},
});
