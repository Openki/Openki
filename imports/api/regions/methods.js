import { Meteor } from 'meteor/meteor';

Meteor.methods({
	'region.setFeaturing'(regionId, featuring) {
		Regions.update(
			{ _id: regionId },
			{ $set: { featuring } }
		);
	}
});
