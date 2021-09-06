import { Router } from 'meteor/iron:router';

import { Groups } from '/imports/api/groups/groups';
import * as GroupsMethods from '/imports/api/groups/methods';

import * as FileStorage from '/imports/utils/FileStorage';
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
		const groupId = this.params._id;

		const group = Groups.findOne(groupId);
		if (!group) {
			throw new Meteor.Error(404, 'Group not found');
		}

		// Upload logo
		const result = await FileStorage.upload('groups/logos/', this.request.files[0]);

		try {
			// Update group
			await GroupsMethods.updateLogo(groupId, result.fullFileName);
		} catch (ex) {
			// Something went wrong. Delete uploaded file.
			await FileStorage.remove(result.fullFileName);
			throw ex;
		}

		// Everything is good. Remove old file.
		if (group.logoUrl && !group.logoUrl.startsWith('https://')) {
			FileStorage.remove(group.logoUrl);
		}
		this.response.writeHead(200);
	},
	where: 'server',
});
