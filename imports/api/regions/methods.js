import { Meteor } from 'meteor/meteor';

Meteor.methods({
	'regions.updateCounters'(selector) {
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

	'region.setFeaturing'(regionId, featuring) {
		Regions.update(regionId, { $set: { featuring } });
	}
});
