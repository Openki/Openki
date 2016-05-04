// ======== DB-Model: ========
// "_id"      -> ID
// "name"     -> String
// "loc"      -> Geodata {type:Point, coordinates: [long, lat]}  (not lat-long !)
// "timeZone" -> String,  ex: "UTC+01:00"
// futureEventCount  Number of future events in that region, calculated field
// ===========================

Regions = new Meteor.Collection("Regions");
if (Meteor.isServer) Regions._ensureIndex({loc : "2dsphere"});

updateRegionEventCount = function(regionId) {
	var futureEventCount = Events.find({ region: regionId, start: { $gte: new Date() } }).count();
	Regions.update(regionId, { $set: { futureEventCount: futureEventCount } });
};

Meteor.methods({
	'updateRegionEventCount': function(selector) {
		Regions.find(selector).forEach(function(region) {
			updateRegionEventCount(region._id);
		});
	}
});
