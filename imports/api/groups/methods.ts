import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import * as HtmlTools from '/imports/utils/html-tools';
import { Users } from '/imports/api/users/users';
import { ServerMethod } from '/imports/utils/ServerMethod';

import { Group, GroupEntity, GroupModel, Groups } from './groups';

import * as FileStorage from '/imports/utils/FileStorage';

function loadGroup(groupId: string) {
	// new!
	if (groupId === '') {
		return new Group() as GroupModel;
	}

	const group = Groups.findOne({ _id: groupId });
	if (!group) {
		throw new Meteor.Error(404, 'Group not found');
	}
	return group;
}

export const save = ServerMethod(
	'group.save',
	(
		groupId: string,
		changes: {
			short?: string;
			name?: string;
			claim?: string;
			description?: string;
		},
	) => {
		check(groupId, String);
		check(changes, {
			short: Match.Optional(String),
			name: Match.Optional(String),
			claim: Match.Optional(String),
			description: Match.Optional(String),
		});

		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, 'please log-in');
		}

		// Load group from DB
		const group = loadGroup(groupId);

		if (!group.editableBy(user)) {
			throw new Meteor.Error(401, 'Denied');
		}

		if (group.isNew()) {
			// Saving user is added as first member of the group
			group.members.push(user._id);
		}

		const updates = {} as Mongo.OptionalId<GroupEntity>;
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

		// Don't update nothing
		if (Object.keys(updates).length === 0) {
			return undefined;
		}

		if (Object.values(updates).some((u) => !u)) {
			throw new Meteor.Error('The name, short, claim and description fields are mandatory.');
		}

		if (group.isNew()) {
			/* eslint-disable-next-line no-param-reassign */
			groupId = Groups.insert(_.extend(group, updates));
			Meteor.call('user.updateBadges', user._id);
		} else {
			Groups.update(group._id as string, { $set: updates });
		}

		return groupId;
	},
);

export const updateLogo = ServerMethod(
	'group.update.logo',
	async (groupId: string, file: FileStorage.UploadFile) => {
		check(groupId, String);

		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, 'please log-in');
		}

		// Load group from DB
		const group = loadGroup(groupId);

		if (group.isNew() || !group.editableBy(user)) {
			throw new Meteor.Error(401, 'Denied');
		}

		if (group.logoUrl && !group.logoUrl.startsWith('https://')) {
			FileStorage.remove(group.logoUrl);
		}

		const result = await FileStorage.upload('groups/logos/', file);

		const update = { logoUrl: result.fullFileName };

		Groups.update(group._id, { $set: update });

		return groupId;
	},
	{ simulation: false },
);

export const deleteLogo = ServerMethod(
	'group.delete.logo',
	async (groupId: string) => {
		check(groupId, String);

		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, 'please log-in');
		}

		// Load group from DB
		const group = loadGroup(groupId);

		if (group.isNew() ||!group.editableBy(user)) {
			throw new Meteor.Error(401, 'Denied');
		}

		if (group.logoUrl && !group.logoUrl.startsWith('https://')) {
			FileStorage.remove(group.logoUrl);
		}

		const update = { logoUrl: '' };

		Groups.update(group._id, { $unset: update });

		return groupId;
	},
	{ simulation: false },
);

export const updateMembership = ServerMethod(
	'group.updateMembership',
	(userId: string, groupId: string, join: boolean) => {
		check(userId, String);
		check(groupId, String);

		const sender = Meteor.user();
		if (!sender) {
			throw new Meteor.Error(401, 'please log-in');
		}

		// Load group from DB
		const group = loadGroup(groupId);

		if (group.isNew() ||!group.editableBy(sender)) {
			throw new Meteor.Error(401, 'Denied');
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
		Groups.update(group._id, update);

		if (Meteor.isServer) {
			Meteor.call('user.updateBadges', user._id);
		}
	},
);
