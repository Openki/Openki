import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Groups } from '/imports/api/groups/groups';

// The code to update the groups and groupOrganizers field must do the same
// thing for Courses and Events. So we parameterize the methods
// with a collection passed as argument on construction.

/**
 * Create an update method for the groups field
 * @param {Object} collection The collection the changes will be applied to when the
 * method is called
 * @return {function} A function that can be used as meteor method
 */
export function promote(collection) {
	return function (docId, groupId, enable) {
		check(docId, String);
		check(groupId, String);
		check(enable, Boolean);

		const doc = collection.findOne(docId);
		if (!doc) {
			throw new Meteor.Error(404, 'Doc not found');
		}

		const group = Groups.findOne(groupId);
		if (!group) {
			throw new Meteor.Error(404, 'Group not found');
		}

		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, 'not permitted');
		}

		const mayPromote = user.mayPromoteWith(group._id);
		const mayEdit = doc.editableBy(user);

		const update = {};
		if (enable) {
			// The user is allowed to add the group if she is part of the group
			if (!mayPromote) {
				throw new Meteor.Error(401, 'not permitted');
			}
			update.$addToSet = { groups: group._id };
		} else {
			// The user is allowed to remove the group if she is part of the group
			// or if she has editing rights on the course
			if (!mayPromote && !mayEdit) {
				throw new Meteor.Error(401, 'not permitted');
			}
			update.$pull = { groups: group._id, groupOrganizers: group._id };
		}

		collection.update(doc._id, update);
		if (Meteor.isServer) {
			collection.updateGroups(doc._id);
		}
	};
}

/**
 * Create an update method for the groupOrganizers field
 * @param {Object} collection the collection the changes will be applied to when the
 * method is called
 * @return {function} A function that can be used as meteor method
 */
export function editing(collection) {
	return function (docId, groupId, enable) {
		check(docId, String);
		check(groupId, String);
		check(enable, Boolean);

		const doc = collection.findOne(docId);
		if (!doc) {
			throw new Meteor.Error(404, 'Doc not found');
		}

		const group = Groups.findOne(groupId);
		if (!group) {
			throw new Meteor.Error(404, 'Group not found');
		}

		const user = Meteor.user();
		if (!user || !doc.editableBy(user)) {
			throw new Meteor.Error(401, 'Not permitted');
		}

		const update = {};
		const op = enable ? '$addToSet' : '$pull';
		update[op] = { groupOrganizers: group._id };

		collection.update(doc._id, update);
		if (Meteor.isServer) {
			collection.updateGroups(doc._id);
		}
	};
}
