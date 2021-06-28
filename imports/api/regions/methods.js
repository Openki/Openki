import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { Courses } from '/imports/api/courses/courses';
import { Events } from '/imports/api/events/events';
import { Regions } from './regions';

/** @typedef {import('./regions').RegionEntity} RegionEntity */

import { AsyncTools } from '/imports/utils/async-tools';
import { ServerMethod } from '/imports/utils/ServerMethod';
import * as StringTools from '/imports/utils/string-tools';
import { isTenantEditableBy } from '/imports/utils/isTenantEditableBy';

export const create = ServerMethod(
	'region.create',
	/**
	 * @param {{
	 * 			tenant: string;
				name: string;
				loc: { type: 'Point', coordinates: [number, number] };
				tz: string;
			}} changes
	 */
	(changes) => {
		check(changes, {
			tenant: String,
			name: String,
			loc: { type: String, coordinates: [Number] },
			tz: String,
		});

		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, 'please log in');
		}

		if (!isTenantEditableBy(changes.tenant, user._id)) {
			throw new Meteor.Error(401, 'not permitted');
		}

		/** @type {RegionEntity} */
		const set = {
			createdby: user._id,
			created: new Date(),
			updated: new Date(),
		};

		set.tenant = changes.tenant;

		set.name = changes.name.trim().substring(0, 40);
		set.nameEn = set.name;
		set.slug = StringTools.slug(set.name);

		set.loc = changes.loc;
		set.loc.type = 'Point';

		set.tz = changes.tz.trim().substring(0, 40);

		return Regions.insert(set);
	},
);

export const update = ServerMethod(
	'region.update',
	/**
	 * @param {string} regionId
	 * @param {{
				name?: string;
				nameEn?: string;
				loc?: { type: 'Point', coordinates: [number, number] };
				tz?: string;
			}} changes
	 */
	(regionId, changes) => {
		check(regionId, String);
		check(changes, {
			name: Match.Optional(String),
			nameEn: Match.Optional(String),
			loc: Match.Optional({ type: String, coordinates: [Number] }),
			tz: Match.Optional(String),
		});

		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, 'please log in');
		}

		const region = Regions.findOne(regionId);
		if (!region) {
			throw new Meteor.Error(404, 'region not found');
		}

		if (isTenantEditableBy(region.tenant, user._id)) {
			throw new Meteor.Error(401, 'not permitted');
		}

		/* Changes we want to perform */

		/** @type {RegionEntity} */
		const set = { updated: new Date() };

		if (changes.name) {
			set.name = changes.name.trim().substring(0, 40);
		}

		if (changes.nameEn) {
			set.nameEn = changes.nameEn.trim().substring(0, 40);
			set.slug = StringTools.slug(set.nameEn);
		}
		if (changes.loc) {
			set.loc = changes.loc;
			set.loc.type = 'Point';
		}

		if (changes.tz) {
			set.tz = changes.tz.trim().substring(0, 40);
		}

		Regions.update({ _id: regionId }, { $set: set }, AsyncTools.checkUpdateOne);

		return regionId;
	},
);

export const remove = ServerMethod(
	'region.remove',
	/**
	 * @param {string} regionId
	 */
	(regionId) => {
		check(regionId, String);

		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, 'please log in');
		}

		const region = Regions.findOne(regionId);
		if (!region) {
			throw new Meteor.Error(404, 'region not found');
		}

		if (isTenantEditableBy(region.tenant, user._id)) {
			throw new Meteor.Error(401, 'not permitted');
		}

		return Regions.remove(regionId);
	},
);

export const featureGroup = ServerMethod(
	'region.featureGroup',
	/**
	 * @param {string} regionId
	 * @param {string} groupId
	 */
	(regionId, groupId) => {
		Regions.update(regionId, { $set: { featuredGroup: groupId } });
	},
);

export const unsetFeaturedGroup = ServerMethod(
	'region.unsetFeaturedGroup',
	/**
	 * @param {string} regionId
	 */
	(regionId) => {
		Regions.update(regionId, { $set: { featuredGroup: false } });
	},
);

Meteor.methods({
	'region.updateCounters'(selector) {
		Regions.find(selector).forEach((region) => {
			// We don't use AsyncTools.untilClean() here because consistency doesn't matter
			const regionId = region._id;

			const courseCount = Courses.find({ region: regionId, internal: false }).count();
			const futureEventCount = Events.find({
				region: regionId,
				internal: false,
				start: { $gte: new Date() },
			}).count();

			Regions.update(regionId, { $set: { courseCount, futureEventCount } });
		});
	},
});
