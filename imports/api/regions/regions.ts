import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { Match, check } from 'meteor/check';

import { UserModel } from '/imports/api/users/users';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import * as Predicates from '/imports/utils/predicates';
import { Filtering } from '/imports/utils/filtering';
import { PublicSettings } from '/imports/utils/PublicSettings';

export interface Geodata {
	type: 'Point';
	/** (not lat-long !) */
	coordinates: [long: number, lat: number];
}

export interface RegionEntity {
	/** ID */
	_id: string;
	tenant: string;
	name: string;
	nameEn: string;

	slug: string;
	loc?: Geodata;
	/** ex: "UTC+01:00" */
	tz: string;
	/**
	 * Number of courses in that region, calculated field (does not count internal or archived
	 * courses)
	 */
	courseCount: number;
	/**
	 * Number of future events in that region, calculated field (does not count internal courses)
	 */
	futureEventCount: number;
	/** ID of featured group */
	featuredGroup: string;
	custom?: {
		siteName?: string;
		siteStage?: string;
		headerLogo?: {
			/** The logo in the top left corner. Can be a logo from the /public/logo/* folder or a base64 encoded string. */
			src: string;
			alt: string;
		};
		headerLogoKiosk?: {
			/** The logo in the top left corner from the /kiosk/events/ page. Can be a logo from the /public/logo/* folder or a base64 encoded string. */
			src: string;
			alt: string;
		};
		/** Can be a logo from the /private/* folder or a base64 encoded string. */
		emailLogo?: string;
	};
	createdby?: string;
	created?: Date;
	updated?: Date;
}

export type RegionModel = Region & RegionEntity;

export class Region {
	isPrivate(this: RegionModel) {
		return !PublicSettings.publicTenants.includes(this.tenant);
	}

	/**
	 * Check whether a user may edit the region.
	 */
	editableBy(this: RegionModel, user?: UserModel) {
		if (!user) {
			return false;
		}

		return (
			UserPrivilegeUtils.privileged(user, 'admin') /* Admins can edit all regions */ ||
			user.isTenantAdmin(this.tenant) /* or admins of a tenant */
		);
	}
}

export class RegionsCollection extends Mongo.Collection<RegionEntity, RegionModel> {
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
	 * @param filter dictionary with filter options
	 * @param limit how many to find
	 * @param skip skip this many before returning results
	 * @param sort list of fields to sort by
	 */
	findFilter(
		filter: { /** restrict to regions in that tenant */ tenant?: string } = {},
		limit = 0,
		skip = 0,
		sort: [string, 'asc' | 'desc'][],
	) {
		check(limit, Match.Maybe(Number));
		check(skip, Match.Maybe(Number));
		check(sort, Match.Maybe([[String]]));

		const selector: Mongo.Selector<RegionEntity> = {};

		const options: Mongo.Options<RegionEntity> = { sort };

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
