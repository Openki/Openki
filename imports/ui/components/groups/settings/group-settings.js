import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Groups } from '/imports/api/groups/groups';
import * as GroupsMethods from '/imports/api/groups/methods';
import { Users } from '/imports/api/users/users';

import { userSearchPrefix } from '/imports/utils/user-search-prefix';
import { MeteorAsync } from '/imports/utils/promisify';

import '/imports/ui/components/buttons/buttons';

import './group-settings.html';

Template.groupSettings.onCreated(function () {
	const instance = this;

	// strip https:// from logoUrl because its already labeled as prefix
	const { logoUrl } = instance.data.group;
	if (logoUrl?.startsWith('https://')) {
		instance.data.group.logoUrl = logoUrl.replace('https://', '');
	}

	instance.busy(false);

	instance.userSearch = new ReactiveVar('');

	instance.autorun(() => {
		const search = instance.userSearch.get();
		if (search.length > 0) {
			Meteor.subscribe('userSearch', search);
		}
	});
});

Template.groupSettings.helpers({
	foundUsers(group) {
		const instance = Template.instance();

		const search = instance.userSearch.get();
		if (search === '') {
			return false;
		}

		return userSearchPrefix(search, { exclude: group.members, limit: 30 });
	},

	kioskEventURL(group) {
		return Router.routes.kioskEvents.url({}, { query: { group: group._id } });
	},
	timetableURL(group) {
		return Router.routes.timetable.url({}, { query: { group: group._id } });
	},
	scheduleURL(group) {
		return Router.routes.frameSchedule.url({}, { query: { group: group._id } });
	},
	frameEventsURL(group) {
		return Router.routes.frameEvents.url({}, { query: { group: group._id } });
	},
	frameWeekURL(group) {
		return Router.routes.frameWeek.url({}, { query: { group: group._id } });
	},
	frameCalendarURL(group) {
		return Router.routes.frameCalendar.url({}, { query: { group: group._id } });
	},
	frameListURL(group) {
		return Router.routes.frameCourselist.url({}, { query: { group: group._id } });
	},
});

Template.groupSettings.events({
	'keyup .js-search-users'(_event, instance) {
		instance.userSearch.set(instance.$('.js-search-users').val());
	},

	async 'click .js-member-add-btn'() {
		const memberId = this._id;
		const groupId = Router.current().params._id;
		try {
			await MeteorAsync.call('group.updateMembership', memberId, groupId, true);
			const memberName = Users.findOne(memberId)?.username;
			const groupName = Groups.findOne(groupId)?.name;
			Alert.success(
				mf(
					'groupSettings.memberAdded',
					{ MEMBER: memberName, GROUP: groupName },
					'"{MEMBER}" has been added as a member to the group "{GROUP}"',
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Could not add member');
		}
	},

	async 'click .js-member-remove-btn'() {
		const memberId = `${this}`;
		const groupId = Router.current().params._id;
		try {
			await GroupsMethods.updateMembership(memberId, groupId, false);
			const memberName = Users.findOne(memberId)?.username;
			const groupName = Groups.findOne(groupId)?.name;
			Alert.success(
				mf(
					'groupSettings.memberRemoved',
					{ MEMBER: memberName, GROUP: groupName },
					'"{MEMBER}" has been removed from to the group "{GROUP}"',
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Could not remove member');
		}
	},

	'input .js-logo-url'(_event, instance) {
		const elem = instance.$('.js-logo-url');
		if (elem.val().includes('://')) {
			elem.val(elem.val().split('://')[1], 1);
		}
	},

	async 'click .js-group-edit-save'(event, instance) {
		event.preventDefault();

		const parentInstance = instance.parentInstance(); // Not available in callback

		let url = instance.$('.js-logo-url').val().trim();

		// strip protocol if needed
		if (url.includes('://')) {
			url = url.split('://')[1];
		}

		url = `https://${url}`;

		instance.busy('saving');
		const changes = {
			logoUrl: url,
		};

		const groupId = instance.data.group._id;
		try {
			await GroupsMethods.save(groupId, changes);
			const groupName = Groups.findOne(groupId)?.name;
			Alert.success(
				mf(
					'groupSettings.groupChangesSaved',
					{ GROUP: groupName },
					'Your changes to the settings of the group "{GROUP}" have been saved.',
				),
			);
			parentInstance.editingSettings.set(false);
		} catch (err) {
			Alert.serverError(err, 'Could not save settings');
		} finally {
			instance.busy(false);
		}
	},

	'click .js-group-edit-cancel'(_event, instance) {
		instance.parentInstance().editingSettings.set(false);
	},
});
