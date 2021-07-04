import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
/**
 * @typedef {Object} Geodata
 * @property {'Point'} type
 * @property {[long:number, lat:number]} coordinates (not lat-long !)
 */
/**
 * @typedef {Object} RegionEntity
 * @property {string} _id ID
 * @property {string} tenant
 * @property {string} name ID
 * @property {string} nameEn ID
 * @property {Geodata} [loc] (Optional)
 * @property {string} tz ex: "UTC+01:00"
 * @property {number} courseCount Number of courses in that region, calculated field
 * (does not count internal courses)
 * @property {number} futureEventCount Number of future events in that region, calculated field
 * (does not count internal courses)
 * @property {string} featuredGroup ID of featured group
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
			this._ensureIndex({ members: 1 });
			this._ensureIndex({ loc: '2dsphere' });
		}
	}

	/**
	 * Returns the region from the db based on the session setting.
	 */
	currentRegion() {
		const regionId = Session.get('region');

		if (!regionId) {
			return undefined;
		}

		return this.findOne(regionId);
	}
}

export const Regions = new RegionsCollection();

export default Regions;
