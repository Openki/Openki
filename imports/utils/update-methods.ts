import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Groups } from '/imports/api/groups/groups';
import { UserModel } from '/imports/api/users/users';

// The code to update the groups and groupOrganizers field must do the same
// thing for Courses and Events. So we parameterize the methods
// with a collection passed as argument on construction.

/**
 * Create an update method for the groups field
 * @param collection The collection the changes will be applied to when the method is called
 */
export function promote<
	T extends { groups: string[]; groupOrganizers: string[] },
	U extends { _id: string; editableBy: (user: UserModel) => boolean },
>(collection: Mongo.Collection<T, U> & { updateGroups: (docId: string) => void }) {
	return function (docId: string, groupId: string, enable: boolean) {
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

		const update: any = {};
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
 * @param collection the collection the changes will be applied to when the method is called
 * @return A function that can be used as meteor method
 */
export function editing<
	T extends { groupOrganizers: string[] },
	U extends { _id: string; editableBy: (user: UserModel) => boolean },
>(collection: Mongo.Collection<T, U> & { updateGroups: (docId: string) => void }) {
	return function (docId: string, groupId: string, enable: boolean) {
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

		const update: any = {};
		const op = enable ? '$addToSet' : '$pull';
		update[op] = { groupOrganizers: group._id };

		collection.update(doc._id, update);
		if (Meteor.isServer) {
			collection.updateGroups(doc._id);
		}
	};
}
