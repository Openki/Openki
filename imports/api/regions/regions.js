import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

/** @typedef {import('../users/users').UserModel} UserModel */

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import Predicates from '/imports/utils/predicates';
import { Filtering } from '/imports/utils/filtering';
import { isTenantAdmin } from '/imports/utils/is-tenant-admin';

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
 * @property {string} [slug]
 * @property {Geodata} [loc] (Optional)
 * @property {string} [tz] ex: "UTC+01:00"
 * @property {number} [courseCount] Number of courses in that region, calculated field
 * (does not count internal or archived courses)
 * @property {number} [futureEventCount] Number of future events in that region, calculated field
 * (does not count internal events)
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
 *
 * @property {string} [createdby]
 * @property {Date}   [created]
 * @property {Date}   [updated]
 */

/**
 * @typedef {Region & RegionEntity} RegionModel
 */

export class Region {
	/**
	 * Check whether a user may edit the region.
	 * @this {RegionModel}
	 * @param {UserModel | undefined} user
	 */
	editableBy(user) {
		if (!user) {
			return false;
		}
		if (!this.tenant) {
			return false;
		}

		return (
			UserPrivilegeUtils.privileged(user, 'admin') /* Admins can edit all regions */ ||
			isTenantAdmin(user._id, this.tenant) /* or admins of a tenant */
		);
	}
}

/**
 * @extends {Mongo.Collection<RegionEntity, RegionModel>}
 */
export class RegionsCollection extends Mongo.Collection {
	constructor() {
		super('Regions', {
			transform(region) {
				return _.extend(new Region(), region);
			},
		});

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
