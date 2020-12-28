import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
// _id              -> ID
// name             -> String
// nameEn           -> String
// loc              -> Geodata {type: Point, coordinates: [long, lat]}  (not lat-long !) (Optional)
// timeZone         -> String,  ex: "UTC+01:00"
// courseCount      -> Number of courses in that region, calculated field
//                     (does not count internal courses)
// futureEventCount -> Number of future events in that region, calculated field
//                     (does not count internal courses)
// featuredGroup    -> ID of featured group
// custom           -> {
//      siteName: String,
//      siteStage: String,
//      headerLogo: {
//            src: String,
//            alt: String,
//      },
//      mailLogo: String,
//    } (Optional)
// ===========================

export default Regions = new Mongo.Collection('Regions');
if (Meteor.isServer) {
	Regions._ensureIndex({ loc: '2dsphere' });
}

/**
 * Returns the region from the db based on the session setting.
 * @returns {{
	_id: string;
	name: string;
	nameEn: string;
	loc?:  { type: Point, coordinates: [long, lat] };
	timeZone: string;
	courseCount: number;
	futureEventCount: number;
	featuredGroup: string;
	custom?: {
		siteName: string;
		siteStage: string;
		headerLogo: {
			src: string;
			alt: string;
		},
		mailLogo: string;
	}
}}
 */
Regions.currentRegion = function () {
	if (Session.get('region')) {
		return Regions.findOne(Session.get('region'));
	}
	return undefined;
};
