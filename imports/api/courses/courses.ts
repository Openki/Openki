import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { Match, check } from 'meteor/check';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { AsyncTools } from '/imports/utils/async-tools';
import { Filtering } from '/imports/utils/filtering';
import * as Predicates from '/imports/utils/predicates';
import * as StringTools from '/imports/utils/string-tools';

import { hasRoleUser } from '/imports/utils/course-role-utils';
/** @typedef {import('imports/api/users/users').UserModel} UserModel */
// eslint-disable-next-line import/no-cycle
import * as tenantDenormalizer from './tenantDenormalizer';
import { PublicSettings } from '/imports/utils/PublicSettings';
import { UserModel } from '../users/users';

interface CourseMemberEntity {
	user: string;
	roles: string[];
	comment: string;
}

/** DB-Model */
interface CourseEntity {
	_id: string;
	tenant: string;
	name: string;
	/** ID categories */
	categories: string[];
	/** (not used) */
	tags: string[];
	/** List ID_groups ("promote groups") */
	groups: string[];
	/**
	 * List of group ID that are allowed to edit the course ("team groups", based on the ui design:
	 * Every "team group" promotes the course and is part of the groups list)
	 */
	groupOrganizers: string[];
	description: string;
	slug: string;
	/** ID_region */
	region: string;
	/** (what for?) */
	date: Date;
	/** ID_user */
	createdby: string;
	time_created: Date;
	time_lastedit: Date;
	/** [role-keys] */
	roles: string[];
	members: CourseMemberEntity[];
	internal: boolean;
	archived: boolean;
	history: {
		dateTime: Date;
		type: string;
		data: any;
	};
	/**
	 * (calculated) List of user and group id allowed to edit the course, calculated from members
	 * and groupOrganizers
	 */
	editors: string[];
	/** (calculated) count of events still in the future for this course */
	futureEvents: number;
	/** (calculated) next upcoming event object, only includes the _id and start field */
	nextEvent: object;
	/** (calculated) most recent event object, only includes the _id and start field */
	lastEvent: object;
	/** (calculated) */
	interested: number;
}

export type CourseModel = Course & CourseEntity;

export class Course {
	members: CourseMemberEntity[] = [];
	roles: string[] = [];
	groupOrganizers: string[] = [];

	/**
	 * Check if the course is new (not yet saved).
	 */
	isNew(this: CourseModel) {
		return !this._id;
	}

	isPrivate(this: CourseModel) {
		return !PublicSettings.publicTenants.includes(this.tenant);
	}

	/**
	 * Check whether a user may edit the course.
	 */
	editableBy(this: CourseModel, user: UserModel | null | undefined) {
		if (!user) {
			return false;
		}
		return (
			this.isNew() /* Anybody may create a new course */ ||
			UserPrivilegeUtils.privileged(user, 'admin') /* Admins can edit all courses */ ||
			_.intersection(user.badges, this.editors).length > 0
		);
	}

	/**
	 * Get list of members with specified role
	 * @param role like 'team'
	 */
	membersWithRole(this: CourseModel, role: string) {
		check(role, String);
		return this.members.filter((member) => member.roles.includes(role));
	}

	userHasRole(this: CourseModel, userId: string | undefined | null, role: string) {
		return hasRoleUser(this.members, role, userId);
	}
}

export class CoursesCollection extends Mongo.Collection<CourseEntity, CourseModel> {
	constructor() {
		super('Courses', {
			transform(course: CourseEntity) {
				return _.extend(new Course(), course);
			},
		});

		if (Meteor.isServer) {
			this._ensureIndex({ tenant: 1, archived: 1, region: 1, time_lastedit: 1, groups: 1 });
		}
	}

	insert(course: CourseModel, callback?: Function) {
		const enrichedCourse = tenantDenormalizer.beforeInsert(course);

		return super.insert(enrichedCourse, callback);
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({
			region: Predicates.id,
			search: Predicates.string,
			group: Predicates.string,
			categories: Predicates.ids,
			state: Predicates.string,
			needsRole: Predicates.ids,
			internal: Predicates.flag,
			archived: Predicates.flag,
		});
	}

	/**
	 * Update the number of interested user
	 */
	updateInterested(courseId: string) {
		AsyncTools.untilClean((resolve, reject) => {
			const course = this.findOne(courseId);

			if (!course) {
				// If the course doesn't exist it doesn't need updating
				resolve(true);
				return;
			}

			this.rawCollection().update(
				{ _id: course._id },
				{
					$set: {
						interested: course.members?.length || 0,
					},
				},
				(err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(result.result.nModified === 0);
					}
				},
			);
		});
	}

	/**
	 * Update list of editors
	 */
	updateGroups(courseId: string) {
		AsyncTools.untilClean((resolve, reject) => {
			const course = this.findOne(courseId);

			if (!course) {
				// If the course doesn't exist it doesn't need updating
				resolve(true);
				return;
			}

			const editors = course.groupOrganizers.slice();

			course.members.forEach((member) => {
				if (member.roles.includes('team')) {
					editors.push(member.user);
				}
			});

			const update = { $set: { editors } };

			this.rawCollection().update({ _id: course._id }, update, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result.result.nModified === 0);
				}
			});
		}).then(
			() => {
				// At some point we'll have to figure out a proper caching hierarchy
				Meteor.call('event.updateGroups', { courseId });
			},
			(reason) => {
				/* eslint-disable-next-line no-console */
				console.log(`Failed updateGroups: ${reason}`);
			},
		);
	}

	/**
	 * @param limit how many to find
	 * @param skip skip this many before returning results
	 * @param sort list of fields to sort by
	 */
	findFilter(
		filter: {
			tenants?: string[];
			region?: string;
			state?: 'proposal' | 'resting' | 'upcomingEvent';
			userInvolved?: string;
			categories?: string[];
			group?: string;
			internal?: boolean;
			search?: string;
			needsRole?: ('host' | 'mentor' | 'team')[];
			archived?: boolean;
		} = {},
		limit: number = 0,
		skip: number = 0,
		sort: [string, 'asc' | 'desc'][],
	) {
		check(limit, Match.Maybe(Number));
		check(skip, Match.Maybe(Number));
		check(sort, Match.Maybe([[String]]));

		const find: Mongo.Selector<CourseEntity> = {};
		const options: Mongo.Options<CourseEntity> = {};
		const order = sort || [];

		if (limit > 0) {
			options.limit = limit;
		}

		if (skip > 0) {
			options.skip = skip;
		}

		if (!filter.archived) {
			find.archived = { $ne: true }; // hide archived by default
		} else {
			find.archived = { $eq: true }; // only show archived
		}

		if (filter.tenants && filter.tenants.length > 0) {
			find.tenant = { $in: filter.tenants };
		}

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
			if (needsRole.includes('host')) {
				missingRoles.push('host');
				mustHaveRoles.push('host');
			}

			if (needsRole.includes('mentor')) {
				missingRoles.push('mentor');
				mustHaveRoles.push('mentor');
			}

			if (needsRole.includes('team')) {
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
			const searchQueries = searchTerms.map((searchTerm) => ({
				$or: [
					{ name: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } },
					{ description: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } },
				],
			}));

			find.$and = searchQueries;
		}

		options.sort = order;

		// Load only data that is useful for list views.
		options.fields = {
			'members.comment': 0,
			history: 0,
			'nextEvent.editors': 0,
			'nextEvent.facilities': 0,
			'nextEvent.loc': 0,
			'lastEvent.editors': 0,
			'lastEvent.facilities': 0,
			'lastEvent.loc': 0,
		};

		return this.find(find, options);
	}
}

export const Courses = new CoursesCollection();

export default Courses;
