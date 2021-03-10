import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { Match, check } from 'meteor/check';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import AsyncTools from '/imports/utils/async-tools';
import Filtering from '/imports/utils/filtering';
import Predicates from '/imports/utils/predicates';
import StringTools from '/imports/utils/string-tools';

import { HasRoleUser } from '/imports/utils/course-role-utils';
/** @typedef {import('imports/api/users/users').UserModel} UserModel */
import tenantDenormalizer from './tenantDenormalizer';

// ======== DB-Model: ========
/**
 * @typedef {Object} CourseMemberEntity
 * @property {string} user user id
 * @property {string[]} roles
 * @property {string} comment
 */
/**
 * @typedef {Object} CourseEntity
 * @property {string} _id          ID
 * @property {string} [tenant]
 * @property {string} name
 * @property {string[]} categories ID_categories
 * @property {string[]} tags       (not used)
 * @property {string[]} groups     List ID_groups
 * @property {string[]} groupOrganizers  List of group ID that are allowed to edit the course
 * @property {string} description
 * @property {string} slug
 * @property {string} region ID_region
 * @property {Date} date (what for?)
 * @property {string} createdby ID_user
 * @property {Date} time_created
 * @property {Date} time_lastedit
 * @property {string[]} roles [role-keys]
 * @property {CourseMemberEntity[]} members
 * @property {boolean} internal
 * @property {string[]} editors (calculated) List of user and group id allowed to edit the course,
 * calculated from members and groupOrganizers
 * @property {number} futureEvents  (calculated) count of events still in the future for this course
 * @property {object} nextEvent  (calculated) next upcoming event object, only includes the _id and
 * start field
 * @property {object} lastEvent  (calculated) most recent event object, only includes the _id and
 * start field
 * @property {number} interested (calculated)
 */

/** @typedef {Course & CourseEntity} CourseModel */

export class Course {
	constructor() {
		/** @type {CourseMemberEntity[]} */
		this.members = [];
		/** @type {string[]} */
		this.roles = [];
		/** @type {string[]} */
		this.groupOrganizers = [];
	}

	/**
	 * Check if the course is new (not yet saved).
	 * @this {CourseModel}
	 */
	isNew() {
		return !this._id;
	}

	/**
	 * Check whether a user may edit the course.
	 * @this {CourseModel}
	 * @param {string | UserModel | null | undefined} user
	 */
	editableBy(user) {
		if (!user) {
			return false;
		}
		const isNew = !this._id;
		return isNew // Anybody may create a new course
			|| UserPrivilegeUtils.privileged(user, 'admin') // Admins can edit all courses
			|| _.intersection(user.badges, this.editors).length > 0;
	}

	/**
	 * Get list of members with specified role
	 * @this {CourseModel}
	 * @param {string} role like 'team'
	 */
	membersWithRole(role) {
		check(role, String);
		return this.members.filter((member) => member.roles.indexOf(role) >= 0);
	}

	/**
	 * @this {CourseModel}
	 * @param {string} userId
	 * @param {string} role
	 */
	userHasRole(userId, role) {
		return HasRoleUser(this.members, role, userId);
	}
}

/**
 * @extends {Mongo.Collection<CourseModel>}
 */
export class CoursesCollection extends Mongo.Collection {
	constructor() {
		super('Courses', {

			/**
			 * @param {CourseEntity} course
			 */
			transform(course) {
				return _.extend(new Course(), course);
			},
		});
	}

	/**
	 * @param {CourseModel} course
	 * @param {Function | undefined} [callback]
	 */
	insert(course, callback) {
		const enrichedCourse = tenantDenormalizer.enrich(course);

		return super.insert(enrichedCourse, callback);
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering(
			{
				region: Predicates.id,
				search: Predicates.string,
				group: Predicates.string,
				categories: Predicates.ids,
				state: Predicates.string,
				needsRole: Predicates.ids,
				internal: Predicates.flag,
			},
		);
	}


	/**
	 * Update the number of interested user
	 * @param {string} courseId
	 */
	updateInterested(courseId) {
		AsyncTools.untilClean((resolve, reject) => {
			const course = this.findOne(courseId);

			if (!course) {
				// If the course doesn't exist it doesn't need updating
				resolve(true);
				return;
			}

			this.rawCollection().update({ _id: course._id }, {
				$set: {
					interested: course.members?.length || 0,
				},
			}, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result.result.nModified === 0);
				}
			});
		});
	}

	/**
	 * Update list of editors
	 * @param {string} courseId
	 */
	updateGroups(courseId) {
		AsyncTools.untilClean((resolve, reject) => {
			const course = this.findOne(courseId);

			if (!course) {
				// If the course doesn't exist it doesn't need updating
				resolve(true);
				return;
			}

			const editors = course.groupOrganizers.slice();

			course.members.forEach((member) => {
				if (member.roles.indexOf('team') >= 0) {
					editors.push(member.user);
				}
			});

			const update = { $set: { editors } };

			this.rawCollection().update({ _id: course._id },
				update,
				(err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(result.result.nModified === 0);
					}
				});
		}).then(() => {
			// At some point we'll have to figure out a proper caching hierarchy
			Meteor.call('event.updateGroups', { courseId });
		}, (reason) => {
			/* eslint-disable-next-line no-console */
			console.log(`Failed updateGroups: ${reason}`);
		});
	}

	/**
	 * @param {{ region?: string;
	 * state?: "proposal" | "resting" | "upcomingEvent";
	 * userInvolved?: string;
	 * categories?: string[];
	 * group?: string;
	 * internal?: boolean;
	 * search?: string;
	 * needsRole?: ("host"|"mentor"|"team")[];
	 * }} filter
	 * @param {number} [limit]
	 * @param {any[]} [sortParams]
	 */
	findFilter(filter, limit, sortParams) {
		check(limit, Match.Optional(Number));
		check(sortParams, Match.Optional([[Match.Any]]));

		const order = sortParams || [];

		const find = {};
		find.tenant = { $in: Meteor.user()?.tenants || [] };

		if (filter.region && filter.region !== 'all') {
			find.region = filter.region;
		}

		if (filter.state === 'proposal') {
			find.lastEvent = { $eq: null };
			find.futureEvents = { $eq: 0 };
			order.push(['time_lastedit', 'desc']);
		}

		if (filter.state === 'resting') {
			find.lastEvent = { $ne: null };
			find.futureEvents = { $eq: 0 };
			order.push(['time_lastedit', 'desc']);
			order.push(['nextEvent.start', 'asc']);
		}

		if (filter.state === 'upcomingEvent') {
			find.futureEvents = { $gt: 0 };
			order.push(['nextEvent.start', 'asc']);
			order.push(['time_lastedit', 'desc']);
		}

		order.push(['time_lastedit', 'desc']);
		order.push(['time_created', 'desc']);

		const mustHaveRoles = [];
		const missingRoles = [];

		const { needsRole } = filter;
		if (needsRole) {
			if (needsRole.indexOf('host') >= 0) {
				missingRoles.push('host');
				mustHaveRoles.push('host');
			}

			if (needsRole.indexOf('mentor') >= 0) {
				missingRoles.push('mentor');
				mustHaveRoles.push('mentor');
			}

			if (needsRole.indexOf('team') >= 0) {
				missingRoles.push('team');
				// All courses have the team role so we don't need to restrict to those having it
			}
		}

		if (filter.userInvolved) {
			find['members.user'] = filter.userInvolved;
		}

		if (filter.categories) {
			find.categories = { $all: filter.categories };
		}

		if (filter.group) {
			find.groups = filter.group;
		}

		if (missingRoles.length > 0) {
			find['members.roles'] = { $nin: missingRoles };
		}

		if (mustHaveRoles.length > 0) {
			find.roles = { $all: mustHaveRoles };
		}

		if (filter.internal !== undefined) {
			find.internal = Boolean(filter.internal);
		}

		if (filter.search) {
			const searchTerms = filter.search.split(/\s+/);
			const searchQueries = _.map(searchTerms, (searchTerm) => ({
				$or: [
					{ name: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } },
					{ description: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } },
				],
			}));

			find.$and = searchQueries;
		}
		const options = { limit, sort: order };
		return this.find(find, options);
	}
}

export default new CoursesCollection();
