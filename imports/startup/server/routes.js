import { Router } from 'meteor/iron:router';

import { Groups } from '/imports/api/groups/groups';

import * as FileStorage from '/imports/utils/FileStorage';
import { isGroupMember } from '/imports/utils/is-group-member';
import Profile from '/imports/utils/profile';

// Server only routes

Router.route('profileNotificationsUnsubscribe', {
	path: '/profile/notifications/unsubscribe/:token',
	action() {
		const unsubToken = this.params.token;

		const accepted = Profile.Notifications.unsubscribe(unsubToken);

		const query = {};
		if (accepted) {
			query.unsubscribed = 'notifications';
		} else {
			query['unsubscribe-error'] = '';
		}

		this.response.writeHead(302, {
			Location: Router.url('profile', {}, { query }),
		});

		this.response.end();
	},
	where: 'server',
});

Router.route('profilePrivateMessagesUnsubscribe', {
	path: '/profile/privatemessages/unsubscribe/:token',
	action() {
		const unsubToken = this.params.token;

		const accepted = Profile.PrivateMessages.unsubscribe(unsubToken);

		const query = {};
		if (accepted) {
			query.unsubscribed = 'privatemessages';
		} else {
			query['unsubscribe-error'] = '';
		}

		this.response.writeHead(302, {
			Location: Router.url('profile', {}, { query }),
		});

		this.response.end();
	},
	where: 'server',
});

Router.route('groupLogo', {
	path: '/group/:_id/logo',
	waitOn() {
		return [Meteor.subscribe('group', this.params._id)];
	},
	async action() {
		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error(401, 'please log-in');
		}

		// Load group from DB
		const group = Groups.findOne(this.params._id);
		if (!group) {
			throw new Meteor.Error(404, 'Group not found');
		}

		// User must be member of group to edit it
		if (!isGroupMember(userId, group._id)) {
			throw new Meteor.Error(401, 'Denied');
		}

		if (group.logoUrl && !group.logoUrl.startsWith('https://')) {
			FileStorage.remove(group.logoUrl);
		}

		const result = await FileStorage.upload('groups/logos/', this.request.files[0]);

		const update = { logoUrl: result.fullFileName };

		Groups.update(group._id, { $set: update });

		this.response.writeHead(200);
	},
	where: 'server',
});
