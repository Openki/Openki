import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import AsyncTools from '/imports/utils/async-tools';
import Filtering from '/imports/utils/filtering';
import Predicates from '/imports/utils/predicates';

import { HasRoleUser } from '/imports/utils/course-role-utils';

// ======== DB-Model: ========
// "_id"           -> ID
// "name"          -> String
// "categories"    -> [ID_categories]
// "tags"          -> List of Strings  (not used)
// "groups"        -> List ID_groups
// groupOrganizers List of group ID that are allowed to edit the course
// "description"   -> String
// "slug"          -> String
// "region"        -> ID_region
// "date"          -> Date             (what for?)
// "createdby"     -> ID_user
// "time_created"  -> Date
// "time_lastedit" -> Date
// "roles"         -> [role-keys]
// "members"       -> [{"user":ID_user,"roles":[role-keys]},"comment":string]
// "internal"      -> Boolean

/** Calculated fields
  *
  * editors: List of user and group id allowed to edit the course, calculated from members and
  *          groupOrganizers
  * futureEvents: count of events still in the future for this course
  * nextEvent: next upcoming event object, only includes the _id and start field
  * lastEvent: most recent event object, only includes the _id and start field
  */
// ======== DB-Model: ========
// "_id"           -> ID
// "name"          -> String
// "categories"    -> [ID_categories]
// "tags"          -> List of Strings  (not used)
// "groups"        -> List ID_groups
// groupOrganizers List of group ID that are allowed to edit the course
// "description"   -> String
// "slug"          -> String
// "region"        -> ID_region
// "date"          -> Date             (what for?)
// "createdby"     -> ID_user
// "time_created"  -> Date
// "time_lastedit" -> Date
// "roles"         -> [role-keys]
// "members"       -> [{"user":ID_user,"roles":[role-keys]},"comment":string]
// "internal"      -> Boolean
/** Calculated fields
  *
  * editors: List of user and group id allowed to edit the course, calculated from members and
  *          groupOrganizers
  * futureEvents: count of events still in the future for this course
  * nextEvent: next upcoming event object, only includes the _id and start field
  * lastEvent: most recent event object, only includes the _id and start field
  */
export class Course {
	constructor() {
		this.members = [];
		this.roles = [];
		this.groupOrganizers = [];
	}

	/** Check whether a user may edit the course.
	  *
	  * @param {Object} user
	  * @return {Boolean}
	  */
	editableBy(user) {
		if (!user) return false;
		const isNew = !this._id;
		return isNew // Anybody may create a new course
			|| UserPrivilegeUtils.privileged(user, 'admin') // Admins can edit all courses
			|| _.intersection(user.badges, this.editors).length > 0;
	}

	/** Get list of members with specified role
	  *
	  * @param {String} role like 'team'
	  * @return {List} of members
	  */
	membersWithRole(role) {
		check(role, String);
		return this.members.filter(member => member.roles.indexOf(role) >= 0);
	}

	userHasRole(userId, role) {
		return HasRoleUser(this.members, role, userId);
	}
}


export const Courses = new Mongo.Collection('Courses', {
	transform(course) {
		return _.extend(new Course(), course);
	},
});

export default Courses;

Courses.Filtering = () => Filtering(
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

// Update list of editors
Courses.updateGroups = function (courseId) {
	AsyncTools.untilClean((resolve, reject) => {
		const course = Courses.findOne(courseId);
		// If the course doesn't exist it doesn't need updating
		if (!course) return resolve(true);

		const editors = course.groupOrganizers.slice();

		course.members.forEach((member) => {
			if (member.roles.indexOf('team') >= 0) {
				editors.push(member.user);
			}
		});

		const update = { $set: { editors } };

		Courses.rawCollection().update({ _id: course._id },
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
		console.log(`Failed updateGroups: ${reason}`);
	});
};

Courses.findFilter = function (filter, limit, sortParams) {
	check(sortParams, Match.Optional([[Match.Any]]));

	const order = sortParams || [];

	const find = {};
	if (filter.region && filter.region !== 'all') find.region = filter.region;

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
		find.internal = !!filter.internal;
	}

	if (filter.search) {
		const searchTerms = filter.search.split(/\s+/);
		const searchQueries = _.map(searchTerms, searchTerm => ({
			$or: [
				{ name: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } },
				{ description: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } },
			],
		}));

		find.$and = searchQueries;
	}
	const options = { limit, sort: order };
	return Courses.find(find, options);
};
