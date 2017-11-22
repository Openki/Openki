import { Meteor } from 'meteor/meteor';

Meteor.methods({
	'regions.updateCounters'(selector) {
		Regions.find(selector).forEach(function(region) {
			// We don't use AsyncTools.untilClean() here because consistency doesn't matter
			const regionId = region._id;
			var courseCount = Courses.find({ region: regionId }).count();
			var futureEventCount = Events.find({ region: regionId, start: { $gte: new Date() } }).count();
			Regions.update(regionId, { $set: {
				courseCount: courseCount,
				futureEventCount: futureEventCount
			} });
		});
	},

	'region.setFeaturing'(regionId, featuring) {
		Regions.update(
			{ _id: regionId },
			{ $set: { featuring } }
		);
	}
});
