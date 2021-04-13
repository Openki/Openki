import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { HtmlTools } from '/imports/utils/html-tools';
import { Users } from '/imports/api/users/users';

import { Groups } from './groups';

import IsGroupMember from '/imports/utils/is-group-member';

Meteor.methods({
	/**
	 * @param {string} groupId
	 * @param {{short?: string;
	 * name?: string;
	 * claim?: string;
	 * description?: string;
	 * logoUrl?: string;}} changes
	 */
	'group.save'(groupId, changes) {
		check(groupId, String);
		check(changes, {
			short: Match.Optional(String),
			name: Match.Optional(String),
			claim: Match.Optional(String),
			description: Match.Optional(String),
			logoUrl: Match.Optional(String),
		});

		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error(401, 'please log-in');
		}

		const isNew = groupId === 'create';

		// Load group from DB
		let group;
		if (isNew) {
			// Saving user is added as first member of the group
			group = {
				members: [userId],
			};
		} else {
			group = Groups.findOne(groupId);
			if (!group) {
				throw new Meteor.Error(404, 'Group not found');
			}
		}

		// User must be member of group to edit it
		if (!isNew && !IsGroupMember(userId, group._id)) {
			throw new Meteor.Error(401, 'Denied');
		}

		const updates = {};
		if (changes.short !== undefined) {
			let short = changes.short.trim();
			if (short.length === 0) {
				short = `${group.name || changes.name}`;
			}
			updates.short = short.substring(0, 7);
		}
		if (changes.name !== undefined) {
			updates.name = changes.name.substring(0, 50);
		}
		if (changes.claim !== undefined) {
			updates.claim = changes.claim.substring(0, 1000);
		}
		if (changes.description !== undefined) {
			const description = changes.description.substring(0, 640 * 1024);
			if (Meteor.isServer) {
				updates.description = HtmlTools.saneHtml(description);
			} else {
				updates.description = description;
			}
		}

		if (changes.logoUrl !== undefined) {
			if (!changes.logoUrl.startsWith('https://')) {
				throw new Meteor.Error('not https');
			}
			updates.logoUrl = changes.logoUrl.substring(0, 1000);
		}

		// Don't update nothing
		if (Object.keys(updates).length === 0) {
			return undefined;
		}

		if (Object.values(updates).some((u) => !u)) {
			throw new Meteor.Error('The name, short, claim and description fields are mandatory.');
		}

		if (isNew) {
			/* eslint-disable-next-line no-param-reassign */
			groupId = Groups.insert(_.extend(group, updates));
			Meteor.call('user.updateBadges', userId);
		} else {
			Groups.update(group._id, { $set: updates });
		}

		return groupId;
	},

	/**
	 * @param {string} userId
	 * @param {string} groupId
	 * @param {boolean} join
	 */
	'group.updateMembership'(userId, groupId, join) {
		check(userId, String);
		check(groupId, String);

		const senderId = Meteor.userId();
		if (!senderId) {
			throw new Meteor.Error('Not permitted');
		}

		// Only current members of the group may draft other people into it
		// We build a selector that only finds the group if the sender is a
		// member of it.
		const sel = {
			_id: groupId,
			members: senderId,
		};

		// This check is not strictly necessary when the update uses the same
		// selector. It generates an error message though, whereas the update is
		// blind to that.
		if (!Groups.findOne(sel)) {
			throw new Meteor.Error('No permitted');
		}

		const user = Users.findOne({ _id: userId });
		if (!user) {
			throw new Meteor.Error(404, 'User not found');
		}

		let update;
		if (join) {
			update = { $addToSet: { members: user._id } };
		} else {
			update = { $pull: { members: user._id } };
		}

		// By using the restrictive selector that checks group membership we can
		// avoid the unlikely race condition where a user is not member anymore
		// but can still add somebody else to the group.
		Groups.update(sel, update);

		if (Meteor.isServer) {
			Meteor.call('user.updateBadges', user._id);
		}
	},
});
