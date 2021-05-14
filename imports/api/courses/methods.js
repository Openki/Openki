import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';

import { Courses, Course } from './courses';
import { Events } from '/imports/api/events/events';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import { Roles } from '/imports/api/roles/roles';
import * as UpdateMethods from '/imports/utils/update-methods';
import * as historyDenormalizer from '/imports/api/courses/historyDenormalizer';
import * as timeLasteditDenormalizer from '/imports/api/courses/timeLasteditDenormalizer';

import { Subscribe, Unsubscribe, Message, processChangeAsync } from './subscription';

import { AsyncTools } from '/imports/utils/async-tools';
import { ServerMethod } from '/imports/utils/ServerMethod';
import * as StringTools from '/imports/utils/string-tools';
import * as HtmlTools from '/imports/utils/html-tools';

import { PleaseLogin } from '/imports/ui/lib/please-login';

const registerMethod = function (method) {
	const apply = function (params) {
		const change = method.read(params);
		try {
			change.validate();
		} catch (message) {
			throw new Meteor.Error('invalid', `Invalid change ${change}:${message}`, message);
		}

		const operator = Meteor.user();

		if (!change.permitted(operator)) {
			throw new Meteor.Error('not-permitted', `Change not permitted: ${change}`, operator);
		}

		const rel = [operator._id];
		const body = { operatorId: operator._id };
		change.provide(rel, body);
		const result = Log.record(method.method, rel, body);
		try {
			change.apply();
		} catch (message) {
			result.error(message);
			throw new Meteor.Error(
				'error-applying',
				`Error applying change ${change}: ${message}`,
				message,
			);
		}
		result.success();
	};

	Meteor.methods({ [method.method]: apply });
};

/**
 * @param {string} courseId
 */
const loadCourse = (courseId) => {
	// new!
	if (courseId === '') {
		return new Course();
	}

	const course = Courses.findOne({ _id: courseId });
	if (!course) {
		throw new Meteor.Error(404, 'Course not found');
	}
	return course;
};

registerMethod(Subscribe);
registerMethod(Unsubscribe);
registerMethod(Message);

Meteor.methods({
	/**
	 * @param {string} courseId
	 */
	'course.save'(courseId, changes) {
		check(courseId, String);
		check(changes, {
			description: Match.Optional(String),
			categories: Match.Optional([String]),
			name: Match.Optional(String),
			region: Match.Optional(String),
			roles: Match.Optional(Object),
			subs: Match.Optional([String]),
			unsubs: Match.Optional([String]),
			groups: Match.Optional([String]),
			internal: Match.Optional(Boolean),
		});

		const user = Meteor.user();
		if (!user) {
			if (Meteor.isClient) {
				PleaseLogin();
				return undefined;
			}
			throw new Meteor.Error(401, 'please log in');
		}

		const course = loadCourse(courseId);

		if (!course.editableBy(user)) {
			throw new Meteor.Error(401, 'edit not permitted');
		}

		/* Changes we want to perform */
		const set = {};

		if (changes.roles) {
			Roles.forEach((role) => {
				const { type } = role;
				const shouldHave = !!(role.preset || changes.roles?.[type]);
				const have = course.roles.includes(type);

				if (have && !shouldHave) {
					Courses.update({ _id: courseId }, { $pull: { roles: type } }, AsyncTools.checkUpdateOne);

					// HACK
					// due to a mongo limitation we can't { $pull { 'members.roles': type } }
					// so we keep removing one by one until there are none left
					while (
						Courses.update(
							{ _id: courseId, 'members.roles': type },
							{ $pull: { 'members.$.roles': type } },
						)
					);
				}
				if (!have && shouldHave) {
					if (course.isNew()) {
						set.roles = set.roles || [];
						set.roles.push(type);
					} else {
						Courses.update(
							{ _id: courseId },
							{ $addToSet: { roles: type } },
							AsyncTools.checkUpdateOne,
						);
					}
				}
			});
		}

		if (changes.description) {
			// 640 k ought to be enough for everybody  -- Mao
			set.description = changes.description.substring(0, 640 * 1024);
			if (Meteor.isServer) {
				set.description = HtmlTools.saneHtml(set.description);
			}
		}

		if (changes.categories) {
			set.categories = changes.categories.slice(0, 20);
		}
		if (changes.name) {
			set.name = StringTools.saneTitle(changes.name).substring(0, 1000);
			set.slug = StringTools.slug(set.name);
		}
		if (changes.internal !== undefined) {
			set.internal = changes.internal;
		}

		if (course.isNew()) {
			// You can add newly created courses to any group
			const testedGroups =
				changes.groups?.map((groupId) => {
					const group = Groups.findOne(groupId);
					if (!group) {
						throw new Meteor.Error(404, `no group with id ${groupId}`);
					}
					return group._id;
				}) || [];
			set.groups = testedGroups;
			set.groupOrganizers = testedGroups;

			/* region cannot be changed */
			const region = Regions.findOne({ _id: changes.region });
			if (!region) {
				throw new Meteor.Error(404, 'region missing');
			}
			set.region = region._id;

			/* When a course is created, the creator is automatically added as sole member of the team */
			set.members = [
				{
					user: user._id,
					roles: ['participant', 'team'],
					comment: mf('courses.creator.defaultMessage', '(has proposed this course)'),
				},
			];
			set.archived = false;
			set.createdby = user._id;
			set.time_created = new Date();
			const enrichedSet = timeLasteditDenormalizer.beforeInsert(set);
			/* eslint-disable-next-line no-param-reassign */
			courseId = Courses.insert(enrichedSet);

			// Init calculated fields
			Meteor.call('course.updateNextEvent', courseId);
			Courses.updateInterested(courseId);
			Courses.updateGroups(courseId);
		} else {
			const enrichedSet = timeLasteditDenormalizer.beforeUpdate(set);
			Courses.update({ _id: courseId }, { $set: enrichedSet }, AsyncTools.checkUpdateOne);

			historyDenormalizer.afterUpdate(courseId, user._id);
		}

		if (changes.subs) {
			const changedCourse = Courses.findOne(courseId);
			changes.subs.forEach((role) => {
				const change = new Subscribe(changedCourse, user, role);
				if (change.validFor(user)) {
					processChangeAsync(change);
				}
			});
		}
		if (changes.unsubs) {
			const changedCourse = Courses.findOne(courseId);
			changes.unsubs.forEach((role) => {
				const change = new Unsubscribe(changedCourse, user, role);
				if (change.validFor(user)) {
					processChangeAsync(change);
				}
			});
		}

		return courseId;
	},

	/**
	 * @param {string} courseId
	 */
	'course.remove'(courseId) {
		const course = Courses.findOne({ _id: courseId });
		if (!course) {
			throw new Meteor.Error(404, 'no such course');
		}
		if (!course.editableBy(Meteor.user())) {
			throw new Meteor.Error(401, 'edit not permitted');
		}
		Events.remove({ courseId });
		Courses.remove(courseId);
	},

	/**
	 * Update the nextEvent field for the courses matching the selector
	 */
	'course.updateNextEvent'(selector) {
		Courses.find(selector).forEach((course) => {
			const futureEvents = Events.find({
				courseId: course._id,
				start: { $gt: new Date() },
			}).count();

			const nextEvent = Events.findOne(
				{ courseId: course._id, start: { $gt: new Date() } },
				{
					sort: { start: 1 },
					fields: {
						startLocal: 1,
						start: 1,
						_id: 1,
						venue: 1,
					},
				},
			);

			const lastEvent = Events.findOne(
				{ courseId: course._id, start: { $lt: new Date() } },
				{
					sort: { start: -1 },
					fields: {
						startLocal: 1,
						start: 1,
						_id: 1,
						venue: 1,
					},
				},
			);

			Courses.update(course._id, {
				$set: {
					futureEvents,
					nextEvent: nextEvent || null,
					lastEvent: lastEvent || null,
				},
			});
		});
	},

	/**
	 * Add or remove a group from the groups list
	 * @param {string} courseId - The course to update
	 * @param {string} groupId - The group to add or remove
	 * @param {boolean} add - Whether to add or remove the group
	 *
	 */
	'course.promote': UpdateMethods.promote(Courses),

	/**
	 * Add or remove a group from the groupOrganizers list
	 * @param {string} courseId - The course to update
	 * @param {string} groupId - The group to add or remove
	 * @param {boolean} add - Whether to add or remove the group
	 *
	 */
	'course.editing': UpdateMethods.editing(Courses),

	/**
	 * Recalculate the editors field
	 */
	'course.updateGroups'(selector) {
		Courses.find(selector).forEach((course) => {
			Courses.updateGroups(course._id);
		});
	},
});

export const archive = ServerMethod(
	'course.archive',
	/**
	 * @param {string} courseId
	 */
	(courseId) => {
		const course = Courses.findOne({ _id: courseId });
		if (!course) {
			throw new Meteor.Error(404, 'no such course');
		}
		if (!course.editableBy(Meteor.user())) {
			throw new Meteor.Error(401, 'edit not permitted');
		}
		return Courses.update(course._id, {
			$set: {
				archived: true,
			},
		});
	},
);

export const unarchive = ServerMethod(
	'course.unarchive',
	/**
	 * @param {string} courseId
	 */
	(courseId) => {
		const course = Courses.findOne({ _id: courseId });
		if (!course) {
			throw new Meteor.Error(404, 'no such course');
		}
		if (!course.editableBy(Meteor.user())) {
			throw new Meteor.Error(401, 'edit not permitted');
		}
		Courses.update(course._id, {
			$set: {
				archived: false,
			},
		});
	},
);
