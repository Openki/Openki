import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { Courses } from '/imports/api/courses/courses';
import { CourseDiscussions } from '/imports/api/course-discussions/course-discussions';
import { Events } from '/imports/api/events/events';
import { Regions } from './regions';
import { Venues } from '/imports/api//venues/venues';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

/** @typedef {import('./regions').RegionEntity} RegionEntity */

import { AsyncTools } from '/imports/utils/async-tools';
import { ServerMethod } from '/imports/utils/ServerMethod';
import * as StringTools from '/imports/utils/string-tools';

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

		if (
			!UserPrivilegeUtils.privileged(user, 'admin') /* Admins can add regions */ &&
			!user.isTenantAdmin(changes.tenant) /* or admins of a tenant */
		) {
			throw new Meteor.Error(401, 'not permitted');
		}

		/** @type {RegionEntity} */
		const set = {
			createdby: user._id,
			created: new Date(),
			updated: new Date(),
			courseCount: 0,
			futureEventCount: 0,
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
				loc?: { type: 'Point', coordinates: [number, number] };
				tz?: string;
			}} changes
	 */
	(regionId, changes) => {
		check(regionId, String);
		check(changes, {
			name: Match.Optional(String),
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

		if (!region.editableBy(user)) {
			throw new Meteor.Error(401, 'not permitted');
		}

		/* Changes we want to perform */

		/** @type {RegionEntity} */
		const set = { updated: new Date() };

		if (changes.name) {
			set.name = changes.name.trim().substring(0, 40);
			set.nameEn = set.name;
			set.slug = StringTools.slug(set.name);
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

		if (!region.editableBy(user)) {
			throw new Meteor.Error(401, 'not permitted');
		}

		if (Courses.find({ region: regionId }).count() > 20) {
			throw new Meteor.Error(
				401,
				'Deleting regions with more than 20 courses is not allowed. Delete courses or contact an administrator. For safety reasons. So that an active region is not deleted by mistake.',
			);
		}

		Events.remove({ region: regionId });
		// CourseDiscussionEntity do not currently have a region.
		Courses.find({ region: regionId }).forEach((c) => {
			CourseDiscussions.remove({ courseId: c._id });
		});
		Courses.remove({ region: regionId });
		Venues.remove({ region: regionId });
		Regions.remove(regionId);
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
		// this denormalization is called every minutes for all regions in the server/start.js file, this ensures consistency.
		Regions.find(selector).forEach((region) => {
			// We don't use AsyncTools.untilClean() here because consistency doesn't matter
			const regionId = region._id;

			const courseCount = Courses.find({
				region: regionId,
				internal: { $ne: true },
				archived: { $ne: true },
			}).count();
			const futureEventCount = Events.find({
				region: regionId,
				internal: { $ne: true },
				start: { $gte: new Date() },
			}).count();

			Regions.update(regionId, { $set: { courseCount, futureEventCount } });
		});
	},
});
