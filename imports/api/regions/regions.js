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

/**
 * @extends {Mongo.Collection<RegionEntity>}
 */
export class RegionsCollection extends Mongo.Collection {
	constructor() {
		super('Regions');

		if (Meteor.isServer) {
			this._ensureIndex({ loc: '2dsphere' });
		}
	}

	/**
	 * Returns the region from the db based on the session setting.
	 * @returns {RegionEntity | undefined}
	 */
	currentRegion() {
		const regionId = Session.get('region');

		if (!regionId) {
			return undefined;
		}

		return this.findOne(regionId);
	}
}
export default new RegionsCollection();
