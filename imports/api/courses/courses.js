import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';
import Filtering from '/imports/utils/filtering.js';
import Predicates from '/imports/utils/predicates.js';

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
  * editors: List of user and group id allowed to edit the course, calculated from members and groupOrganizers
  * futureEvents: count of events still in the future for this course
  * nextEvent: next upcoming event object, only includes the _id and start field
  * lastEvent: most recent event object, only includes the _id and start field
  */

Course = function() {
	this.members = [];
	this.roles = [];
	this.groupOrganizers = [];
};

/** Check whether a user may edit the course.
  *
  * @param {Object} user
  * @return {Boolean}
  */
Course.prototype.editableBy = function(user) {
	if (!user) return false;
	var isNew = !this._id;

	return isNew // Anybody may create a new course
		|| UserPrivilegeUtils.privileged(user, 'admin') // Admins can edit all courses
		|| _.intersection(user.badges, this.editors).length > 0;
};

/** Get list of members with specified role
  *
  * @param {String} role like 'team'
  * @return {List} of members
  */
Course.prototype.membersWithRole = function(role) {
	check(role, String);
	return this.members.filter(function(member) {
		return member.roles.indexOf(role) >= 0;
	});
};

export default Courses = new Mongo.Collection("Courses", {
	transform: function(course) {
		return _.extend(new Course(), course);
	}
});

Courses.Filtering = () => Filtering(
	{ region:     Predicates.id
	, search:     Predicates.string
	, group:      Predicates.string
	, categories: Predicates.ids
	, state:      Predicates.string
	, needsRole:  Predicates.ids
	, internal:   Predicates.flag
	}
);

// Update list of editors
Courses.updateGroups = function(courseId) {
	AsyncTools.untilClean(function() {
		var course = Courses.findOne(courseId);
		if (!course) return true; // Yes Mylord the nonexisting course was duly updated please don't throw a tantrum

		var editors = course.groupOrganizers.slice();

		course.members.forEach(function(member) {
			if (member.roles.indexOf('team') >= 0) {
				editors.push(member.user);
			}
		});

		// We have to use the Mongo collection API because Meteor does not
		// expose the modification counter
		var rawCourses = Courses.rawCollection();
		var result = Meteor.wrapAsync(rawCourses.update, rawCourses)(
			{ _id: course._id },
			{ $set: { editors: editors } },
			{ fullResult: true }
		);
		return result.result.nModified === 0;
	});

	// At some point we'll have to figure out a proper caching hierarchy
	Meteor.call('event.updateGroups', { courseId: courseId });
};

Courses.findFilter = function(filter, limit) {
	var find = {};
	var sort = {time_lastedit: -1, time_created: -1};
	if (filter.region && filter.region != 'all') find.region = filter.region;

	if (filter.state === 'proposal') {
		find.lastEvent = { $eq: null };
		find.futureEvents = { $eq: 0 };
		sort = { time_lastedit: -1 };
	}

	if (filter.state === 'resting') {
		find.lastEvent = { $ne: null };
		find.futureEvents = { $eq: 0 };
		sort = { time_lastedit: -1, "lastEvent.start": 1 };
	}

	if (filter.state === 'upcomingEvent') {
		find.futureEvents = { $gt: 0 };
		sort = { "nextEvent.start": 1, time_lastedit: -1 };
	}

	var mustHaveRoles = [];
	var missingRoles = [];

	var needsRole = filter.needsRole;
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
		var searchTerms = filter.search.split(/\s+/);
		var searchQueries = _.map(searchTerms, function(searchTerm) {
			return { $or: [
				{ name: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } },
				{ description: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } }
			] };
		});

		find.$and = searchQueries;
	}
	var options = { limit: limit, sort: sort };
	return Courses.find(find, options);
};
