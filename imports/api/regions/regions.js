import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
/**
 * @typedef {Object} RegionEntity
 * @property {string} [_id] ID
 * @property {string} [name] ID
 * @property {string} [nameEn] ID
 * @property {{ type: 'Point', coordinates: [number, number] }} [loc] Geodata {type: Point,
 * coordinates: [long, lat]}  (not lat-long !) (Optional)
 * @property {string} [timeZone] ex: "UTC+01:00"
 * @property {number} [courseCount] Number of courses in that region, calculated field
 * (does not count internal courses)
 * @property {number} [futureEventCount] Number of future events in that region, calculated field
 * (does not count internal courses)
 * @property {string} [featuredGroup] ID of featured group
 * @property {{
 *       siteName: string,
 *       siteStage: string,
 *       headerLogo: {
 *             src: string,
 *             alt: string,
 *       },
 *       mailLogo: string,
 *     }} [custom]
 */

/** @type {Mongo.Collection<RegionEntity>} */
const Regions = new Mongo.Collection('Regions');

if (Meteor.isServer) {
	Regions._ensureIndex({ loc: '2dsphere' });
}

/**
 * Returns the region from the db based on the session setting.
 * @returns {RegionEntity | undefined}
 */
Regions.currentRegion = function () {
	if (Session.get('region')) {
		return Regions.findOne(Session.get('region'));
	}
	return undefined;
};

export default Regions;
