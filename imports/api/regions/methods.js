import { Meteor } from 'meteor/meteor';
import Events from '/imports/api/events/events.js';
import Regions from './regions.js';

Meteor.methods({
	'region.updateCounters'(selector) {
		Regions.find(selector).forEach((region) => {
			// We don't use AsyncTools.untilClean() here because consistency doesn't matter
			const regionId = region._id;
			const courseCount = Courses.find({ region: regionId }).count();
			const futureEventCount =
				Events
				.find({ region: regionId, start: { $gte: new Date() } })
				.count();

			Regions.update(regionId, { $set: { courseCount, futureEventCount } });
		});
	},

	'region.featureGroup'(regionId, groupId) {
		Regions.update(regionId, { $set: { featuredGroup: groupId } });
	},

	'region.unsetFeaturedGroup'(regionId) {
		Regions.update(regionId, { $set: { featuredGroup: false } });
	}
});
