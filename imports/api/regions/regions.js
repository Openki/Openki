import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
// _id              -> ID
// name             -> String
// loc              -> Geodata {type:Point, coordinates: [long, lat]}  (not lat-long !) (Optional)
// timeZone         -> String,  ex: "UTC+01:00"
// courseCount      -> Number of courses in that region, calculated field
//                     (does not count internal courses)
// futureEventCount -> Number of future events in that region, calculated field
//                     (does not count internal courses)
// featuredGroup    -> ID of featured group
// siteName         -> String (Optional)
// ===========================

export default Regions = new Mongo.Collection('Regions');
if (Meteor.isServer) {
	Regions._ensureIndex({ loc: '2dsphere' });
}

Regions.currentRegion = function () {
	if (Session.get('region')) {
		return Regions.findOne(Session.get('region'));
	}
	return undefined;
};
