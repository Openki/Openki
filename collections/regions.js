// ======== DB-Model: ========
// _id              -> ID
// name             -> String
// loc              -> Geodata {type:Point, coordinates: [long, lat]}  (not lat-long !)
// timeZone         -> String,  ex: "UTC+01:00"
// courseCount      -> Number of courses in that region, calculated field
// futureEventCount -> Number of future events in that region, calculated field
// ===========================

Regions = new Meteor.Collection("Regions");
if (Meteor.isServer) Regions._ensureIndex({loc : "2dsphere"});

// We don't use untilClean() here because consistency doesn't matter
updateRegionCounters = function(regionId) {
	var courseCount = Courses.find({ region: regionId }).count();
	var futureEventCount = Events.find({ region: regionId, start: { $gte: new Date() } }).count();
	Regions.update(regionId, { $set: {
		courseCount: courseCount,
		futureEventCount: futureEventCount
	} });
};

Meteor.methods({
	'updateRegionCounters': function(selector) {
		Regions.find(selector).forEach(function(region) {
			updateRegionCounters(region._id);
		});
	}
});
