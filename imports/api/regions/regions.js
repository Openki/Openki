import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Mongo } from 'meteor/mongo';
import Predicates from '/imports/utils/predicates';
import { Filtering } from '/imports/utils/filtering';

// ======== DB-Model: ========
/**
 * @typedef {Object} Geodata
 * @property {'Point'} type
 * @property {[long:number, lat:number]} coordinates (not lat-long !)
 */
/**
 * @typedef {Object} RegionEntity
 * @property {string} [_id] ID
 * @property {string} [tenant]
 * @property {string} [name] ID
 * @property {string} [nameEn] ID
 * @property {Geodata} [loc] (Optional)
 * @property {string} [tz] ex: "UTC+01:00"
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
			this._ensureIndex({ tenant: 1 });
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

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({ tenant: Predicates.id });
	}

	/**
	 * Find regions for given filters
	 * @param {object} [filter] dictionary with filter options
	 * @param {string} [filter.tenant] restrict to regions in that tenant
	 * @param {number} [limit] how many to find
	 * @param {number} [skip]
	 * @param {*} [sort]
	 */
	findFilter(filter = {}, limit = 0, skip = 0, sort) {
		const selector = {};

		/** @type {Mongo.Options<RegionEntity>} */
		const options = { sort };

		if (limit > 0) {
			options.limit = limit;
		}

		if (skip > 0) {
			options.skip = skip;
		}

		if (filter.tenant) {
			selector.tenant = filter.tenant;
		}

		return this.find(selector, options);
	}
}

export const Regions = new RegionsCollection();

export default Regions;
