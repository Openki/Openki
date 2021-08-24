import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';

import { Courses, Course, CourseEntity, CourseModel } from './courses';
import { Events } from '/imports/api/events/events';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import { CourseDiscussions } from '../course-discussions/course-discussions';
import { Roles } from '/imports/api/roles/roles';
import * as UpdateMethods from '/imports/utils/update-methods';
import * as historyDenormalizer from '/imports/api/courses/historyDenormalizer';
import * as timeLasteditDenormalizer from '/imports/api/courses/timeLasteditDenormalizer';
import { Log } from '/imports/api/log/log';

import { Subscribe, Unsubscribe, Message, processChange } from './subscription';

import { AsyncTools } from '/imports/utils/async-tools';
import { ServerMethod } from '/imports/utils/ServerMethod';
import * as StringTools from '/imports/utils/string-tools';
import * as HtmlTools from '/imports/utils/html-tools';

import { PleaseLogin } from '/imports/ui/lib/please-login';
import { UserModel } from '../users/users';

function registerMethod(method: {
	method: string;
	read: (body: any) => {
		validate(): void;
		permitted: (user: UserModel | undefined | null) => boolean;
		provide(rel: string[], body: any): void;
		apply(): void;
	};
}): void {
	const apply = function (params: any) {
		const change = method.read(params);
		try {
			change.validate();
		} catch (message) {
			throw new Meteor.Error('invalid', `Invalid change ${change}:${message}`, message);
		}

		const operator = Meteor.user();

		if (!change.permitted(operator)) {
			throw new Meteor.Error(
				'not-permitted',
				`Change not permitted: ${change}`,
				`operator: ${operator?._id}`,
			);
		}

		const rel = [operator?._id as string];
		const body = { operatorId: operator?._id };
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
}

function loadCourse(courseId: string) {
	// new!
	if (courseId === '') {
		return new Course() as CourseModel;
	}

	const course = Courses.findOne({ _id: courseId });
	if (!course) {
		throw new Meteor.Error(404, 'Course not found');
	}
	return course;
}

registerMethod(Subscribe);
registerMethod(Unsubscribe);
registerMethod(Message);

export interface SaveFields {
	description?: string;
	categories?: string[];
	name?: string;
	region?: string;
	roles?: { [type: string]: boolean };
	subs?: string[];
	unsubs?: string[];
	groups?: string[];
	internal?: boolean;
}

export const save = ServerMethod(
	'course.save',

	(courseId: string, changes: SaveFields) => {
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
		const set = {} as Mongo.OptionalId<CourseEntity>;

		if (changes.roles) {
			Roles.forEach((role) => {
				const { type } = role;
				const shouldHave = !!(role.preset || changes.roles?.[type]);
				const have = course.roles.includes(type);

				if (have && !shouldHave) {
					Courses.update(
						{ _id: courseId },
						{ $pull: { roles: type } },
						undefined,
						AsyncTools.checkUpdateOne,
					);

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
							undefined,
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
				changes.groups?.map((groupId: string) => {
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
			Courses.update(
				{ _id: courseId },
				{ $set: enrichedSet },
				undefined,
				AsyncTools.checkUpdateOne,
			);

			historyDenormalizer.afterUpdate(courseId, user._id);
		}

		if (changes.subs) {
			const changedCourse = Courses.findOne(courseId);
			changes.subs.forEach((role: string) => {
				const change = new Subscribe(changedCourse, user, role);
				if (change.validFor(user)) {
					processChange(change);
				}
			});
		}
		if (changes.unsubs) {
			const changedCourse = Courses.findOne(courseId);
			changes.unsubs.forEach((role: string) => {
				const change = new Unsubscribe(changedCourse, user, role);
				if (change.validFor(user)) {
					processChange(change);
				}
			});
		}

		return courseId;
	},
);

/**
 * Add or remove a group from the groups list
 * @param courseId The course to update
 * @param groupId The group to add or remove
 * @param add Whether to add or remove the group
 *
 */
export const promote = ServerMethod('course.promote', UpdateMethods.promote(Courses));

/**
 * Add or remove a group from the groupOrganizers list
 * @param courseId The course to update
 * @param groupId The group to add or remove
 * @param add Whether to add or remove the group
 *
 */
export const editing = ServerMethod('course.editing', UpdateMethods.editing(Courses));

export const archive = ServerMethod('course.archive', (courseId: string) => {
	const course = Courses.findOne({ _id: courseId });
	if (!course) {
		throw new Meteor.Error(404, 'no such course');
	}
	if (!course.editableBy(Meteor.user())) {
		throw new Meteor.Error(401, 'edit not permitted');
	}
	Courses.update(course._id, {
		$set: {
			archived: true,
		},
	});
});

export const unarchive = ServerMethod('course.unarchive', (courseId: string) => {
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
});

export const remove = ServerMethod('course.remove', (courseId: string) => {
	const course = Courses.findOne({ _id: courseId });
	if (!course) {
		throw new Meteor.Error(404, 'no such course');
	}
	if (!course.editableBy(Meteor.user())) {
		throw new Meteor.Error(401, 'edit not permitted');
	}
	Events.remove({ courseId });
	CourseDiscussions.remove({ courseId });
	Courses.remove(courseId);
});

Meteor.methods({
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
	 * Recalculate the editors field
	 */
	'course.updateGroups'(selector) {
		Courses.find(selector).forEach((course) => {
			Courses.updateGroups(course._id);
		});
	},
});
