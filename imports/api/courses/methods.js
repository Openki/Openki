import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import Courses, { Course } from './courses';
import Events from '/imports/api/events/events';
import Groups from '/imports/api/groups/groups';
import Regions from '/imports/api/regions/regions';
import Roles from '/imports/api/roles/roles';
import UpdateMethods from '/imports/utils/update-methods';

import {
	Subscribe, Unsubscribe, Message, processChange,
} from './subscription';

import AsyncTools from '/imports/utils/async-tools';
import StringTools from '/imports/utils/string-tools';
import HtmlTools from '/imports/utils/html-tools';

import PleaseLogin from '/imports/ui/lib/please-login';


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
			throw new Meteor.Error('error-applying', `Error applying change ${change}: ${message}`, message);
		}
		result.success();
	};

	Meteor.methods({ [method.method]: apply });
};

registerMethod(Subscribe);
registerMethod(Unsubscribe);
registerMethod(Message);

Meteor.methods({
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
			if (Meteor.is_client) {
				PleaseLogin();
				return;
			}
			throw new Meteor.Error(401, 'please log in');
		}

		let course;
		const isNew = courseId.length === 0;
		if (isNew) {
			course = new Course();
		} else {
			course = Courses.findOne({ _id: courseId });
			if (!course) throw new Meteor.Error(404, 'Course not found');
		}

		if (!course.editableBy(user)) throw new Meteor.Error(401, 'edit not permitted');

		/* Changes we want to perform */
		const set = {};

		if (changes.roles) {
			_.each(Roles, (roletype) => {
				const { type } = roletype;
				const shouldHave = roletype.preset || changes.roles && changes.roles[type];
				const have = course.roles.indexOf(type) !== -1;

				if (have && !shouldHave) {
					Courses.update(
						{ _id: courseId },
						{ $pull: { roles: type } },
						AsyncTools.checkUpdateOne,
					);

					// HACK
					// due to a mongo limitation we can't { $pull { 'members.roles': type } }
					// so we keep removing one by one until there are none left
					while (Courses.update(
						{ _id: courseId, 'members.roles': type },
						{ $pull: { 'members.$.roles': type } },
					));
				}
				if (!have && shouldHave) {
					if (isNew) {
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

		if (changes.categories) set.categories = changes.categories.slice(0, 20);
		if (changes.name) {
			set.name = StringTools.saneTitle(changes.name).substring(0, 1000);
			set.slug = StringTools.slug(set.name);
		}
		if (changes.internal !== undefined) {
			set.internal = changes.internal;
		}

		set.time_lastedit = new Date();
		if (isNew) {
			// You can add newly created courses to any group
			let testedGroups = [];
			if (changes.groups) {
				testedGroups = _.map(changes.groups, (groupId) => {
					const group = Groups.findOne(groupId);
					if (!group) throw new Meteor.Error(404, `no group with id ${groupId}`);
					return group._id;
				});
			}
			set.groups = testedGroups;
			set.groupOrganizers = testedGroups;

			/* region cannot be changed */
			const region = Regions.findOne({ _id: changes.region });
			if (!region) throw new Meteor.Error(404, 'region missing');
			set.region = region._id;

			/* When a course is created, the creator is automatically added as sole member of the team */
			set.members = [{
				user: user._id,
				roles: ['participant', 'team'],
				comment: mf('courses.creator.defaultMessage', '(has proposed this course)'),
			},
			];
			set.editors = [user._id];
			set.createdby = user._id;
			set.time_created = new Date();
			courseId = Courses.insert(set);

			Meteor.call('course.updateNextEvent', courseId);
		} else {
			Courses.update({ _id: courseId }, { $set: set }, AsyncTools.checkUpdateOne);
		}

		if (changes.subs) {
			const course = Courses.findOne(courseId);
			for (const role of changes.subs) {
				const change = new Subscribe(course, user, role);
				if (change.validFor(user)) processChange(change);
			}
		}
		if (changes.unsubs) {
			const course = Courses.findOne(courseId);
			for (const role of changes.unsubs) {
				const change = new Unsubscribe(course, user, role);
				if (change.validFor(user)) processChange(change);
			}
		}

		return courseId;
	},

	'course.remove'(courseId) {
		const course = Courses.findOne({ _id: courseId });
		if (!course) throw new Meteor.Error(404, 'no such course');
		if (!course.editableBy(Meteor.user())) throw new Meteor.Error(401, 'edit not permitted');
		Events.remove({ courseId });
		Courses.remove(courseId);
	},

	// Update the nextEvent field for the courses matching the selector
	'course.updateNextEvent'(selector) {
		Courses.find(selector).forEach((course) => {
			const futureEvents = Events.find(
				{ courseId: course._id, start: { $gt: new Date() } },
			).count();

			const nextEvent = Events.findOne(
				{ courseId: course._id, start: { $gt: new Date() } },
				{
					sort: { start: 1 },
					fields: {
						startLocal: 1, start: 1, _id: 1, venue: 1,
					},
				},
			);

			const lastEvent = Events.findOne(
				{ courseId: course._id, start: { $lt: new Date() } },
				{
					sort: { start: -1 },
					fields: {
						startLocal: 1, start: 1, _id: 1, venue: 1,
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

	/** Add or remove a group from the groups list
	  *
	  * @param {String} courseId - The course to update
	  * @param {String} groupId - The group to add or remove
	  * @param {Boolean} add - Whether to add or remove the group
	  *
	  */
	'course.promote': UpdateMethods.Promote(Courses),


	/** Add or remove a group from the groupOrganizers list
	  *
	  * @param {String} courseId - The course to update
	  * @param {String} groupId - The group to add or remove
	  * @param {Boolean} add - Whether to add or remove the group
	  *
	  */
	'course.editing': UpdateMethods.Editing(Courses),


	// Recalculate the editors field
	'course.updateGroups'(selector) {
		Courses.find(selector).forEach((course) => {
			Courses.updateGroups(course._id);
		});
	},
});
