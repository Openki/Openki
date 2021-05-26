import { Meteor } from 'meteor/meteor';
import { Courses } from '/imports/api/courses/courses';
import { Events } from '/imports/api/events/events';
import { Regions } from './regions';
import { ServerMethod } from '/imports/utils/ServerMethod';

export const featureGroup = ServerMethod(
	'region.featureGroup',
	/**
	 * @param {string} regionId
	 * @param {string} groupId
	 */
	(regionId, groupId) => {
		Regions.update(regionId, { $set: { featuredGroup: groupId } });
	},
);

export const unsetFeaturedGroup = ServerMethod(
	'region.unsetFeaturedGroup',
	/**
	 * @param {string} regionId
	 */
	(regionId) => {
		Regions.update(regionId, { $set: { featuredGroup: false } });
	},
);

Meteor.methods({
	'region.updateCounters'(selector) {
		Regions.find(selector).forEach((region) => {
			// We don't use AsyncTools.untilClean() here because consistency doesn't matter
			const regionId = region._id;

			const courseCount = Courses.find({ region: regionId, internal: false }).count();
			const futureEventCount = Events.find({
				region: regionId,
				internal: false,
				start: { $gte: new Date() },
			}).count();

			Regions.update(regionId, { $set: { courseCount, futureEventCount } });
		});
	},
});
