import { Course } from './courses.js';
import { User } from '/imports/api/users/users.js';
import { check } from 'meteor/check';

import { HasRole, HasRoleUser } from '/imports/utils/course-role-utils.js';
import Notification from '/imports/notification/notification.js';

export const processChange = function(change, done) {
	Meteor.call("Course." + change.constructor.name, change.dict(), (err) => {
		if (err) Alert.error(err);
		if (done) done();
	});
};

const checkUser = function(obj) {
	if (!(obj instanceof User)) {
		throw Meteor.Error("Match failed", "Expected User object");
	}
};

const checkCourse = function(obj) {
	if (!(obj instanceof Course)) {
		throw new Meteor.Error("Match failed", "Expected Course object");
	}
};

/** A change by a user
 *
 * A change can validate() itself and knows who is permitted() to apply()
 * it to the system. Changes can read() from and write() themselves to
 * dicts suitable for Mongo and JSON serialization.
 *
 * Changes are typically created on the client to find out whether a
 * user is allowed to do something. Then when the user actually does it,
 * the change is sent to the server to be applied.
 *
 */
class Change {
	/**
	 * Find out whether the change makes sense and could be applied
	 * by the given user.
	 */
	validFor(operator) {
		try {
			this.validate();
		} catch(e) {
			return false;
		}
		return this.permitted(operator);
	}
}

export class Subscribe extends Change {
	static read(body) {
		check(body, Object);
		return new this
			( Courses.findOne(body.courseId)
			, Meteor.users.findOne(body.userId)
			, body.role
			, body.comment
			);
	}

	constructor(course, user, role, comment) {
		super();

		checkCourse(course);
		this.course = course;

		checkUser(user);
		this.user = user;

		check(role, String);
		this.role = role;

		check(comment, Match.Optional(String));
		this.comment = comment;
	}

	validate() {
		if (!this.course.roles.includes(this.role)) {
			throw "No role " + role;
		}

		// Do not allow subscribing when already subscribed
		if (HasRoleUser(this.course.members, this.role, this.user._id)) {
			throw "Already subscribed as " + role;
		}
	}

	permitted(operator) {
		if (!operator) return false;

		// Admins may subscribe to all roles
		if (operator.privileged('admin')) {
			return true;
		}

		// The team role is restricted
		if ('team' === this.role) {
			// If there are no team-members, anybody can join
			if (!HasRole(this.course.members, 'team')) {
				return operator._id === this.user._id;
			}

			// Only members of the team can take-on other people
			if (HasRoleUser(this.course.members, 'team', operator._id)) {
				// Only participating users can be drafted
				var candidateRoles = ['participant', 'mentor', 'host'];

				// In for a penny, in for a pound
				for (let role of candidateRoles) {
					if (this.course.userHasRole(this.user._id, role)) {
						return true;
					}
				}
			}
			return false;
		}

		// The other roles can only be chosen by the users themselves
		return operator._id === this.user._id;
	}

	dict() {
		return (
			{ change: "subscribe"
			, courseId: this.course._id
			, userId: this.user._id
			, role: this.role
			, comment: this.comment
			}
		);
	}

	provide(rel, body) {
		rel.push(this.user._id);
		Object.assign(body, this.dict());
	}

	apply() {
		// Add the user as member if she's not listed yet
		// Note that the user will be created with the role already
		// filled to avoid seeing empty list of roles.
		Courses.update(
			{ _id: this.course._id, 'members.user': { $ne: this.user._id } },
			{ $addToSet: { 'members': { user: this.user._id, roles: [ this.role ]} }}
		);

		// Now that we're sure she's listed, add the role too.
		// If we just added her, this is a no-op.
		Courses.update(
			{ _id: this.course._id, 'members.user': this.user._id },
			{ '$addToSet': { 'members.$.roles': this.role }}
		);

		if (this.comment) {
			Courses.update
				( { _id: this.course._id, 'members.user':  this.user._id }
				, { $set: { 'members.$.comment': this.comment } }
				);
		}

		// Updated calculated fields
		Courses.updateGroups(this.course._id);

		// Update the modification date
		Courses.update(this.course._id, { $set: {time_lastedit: new Date()} });

		// Send notifications
		Notification.Join.record(this.course._id, this.user._id, this.role, this.comment);
	}
}

export class Unsubscribe extends Change {
	static read(body) {
		return new this
			( Courses.findOne(body.courseId)
			, Users.findOne(body.userId)
			, body.role
			);
	}

	constructor(course, user, role) {
		super();

		checkCourse(course);
		this.course = course;

		checkUser(user);
		this.user = user;

		check(role, String);
		this.role = role;
	}

	validate() {
		// Do not allow unsubscribing when not subscribed
		if (this.course.userHasRole(this.user._id, this.role)) {
			throw "not subscribed with role " + this.role;
		}
	}

	permitted(operator) {
		if (!operator) return false;

		// Admins may do anything
		if (operator.privileged('admin')) {
			return true;
		}

		// The team role is restricted
		if ('team' === this.role) {
			// Members of the team can take-out other people
			// The nuclear option. We'll have to reconsider this!
			return this.course.userHasRole(operator._id, 'team');
		}

		// The other roles can only be unsubscribed from by the users themselves
		return operator._id === this.user._id;
	}

	dict() {
		return (
			{ change: "unsubscribe"
			, courseId: this.course._id
			, userId: this.user._id
			, role: this.role
			}
		);
	}

	provide(rel, body) {
		rel.push(this.user._id);
		rel.push(this.course._id);
		Object.assign(body, this.dict());
	}

	apply() {
		Courses.update(
			{ _id: this.course._id, 'members.user': this.user._id },
			{ '$pull': { 'members.$.roles': this.role }}
		);

		// Housekeeping: Remove members that have no role left
		Courses.update(
			{ _id: this.course._id },
			{ $pull: { members: { roles: { $size: 0 } }}}
		);

		Courses.updateGroups(this.course._id);
	}
}


export class Message extends Change {
	static read(body) {
        return new this
            ( Courses.findOne(body.courseId)
            , Meteor.users.findOne(body.userId)
			, body.message
            );
	}

	constructor(course, user, message) {
		super();

		checkCourse(course);
		this.course = course;

		checkUser(user);
		this.user = user;

		check(message, Match.Optional(String));
		this.message = message;
	}

	validate() {
		return true;
	}

	permitted(operator) {
		if (!operator) return false;

		// The other roles can only be unsubscribed from by the users themselves
		return operator._id === this.user._id;
	}

	dict() {
		return (
			{ change: "message"
			, courseId: this.course._id
			, userId: this.user._id
			, message: this.message
			}
		);
	}

	provide(rel, body) {
		rel.push(this.user._id);
		rel.push(this.course._id);
		Object.assign(body, this.dict());
	}

	apply() {
		Courses.update(
			{ _id: this.course._id, 'members.user': this.user._id },
			{ $set: { 'members.$.comment': this.message }}
		);
	}
}

