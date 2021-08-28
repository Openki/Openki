import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { GroupEntity, Groups } from '/imports/api/groups/groups';
import * as GroupsMethods from '/imports/api/groups/methods';
import { Users } from '/imports/api/users/users';

import { userSearchPrefix } from '/imports/utils/user-search-prefix';
import { MeteorAsync } from '/imports/utils/promisify';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/file-upload';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	{
		group: GroupEntity | (Partial<GroupEntity> & { _id: 'create' });
	},
	'groupSettings',
	{ userSearch: ReactiveVar<string> }
>;

const template = Template.groupSettings;

template.onCreated(function () {
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

template.helpers({
	foundUsers(group: GroupEntity) {
		const instance = Template.instance();

		const search = instance.userSearch.get();
		if (search === '') {
			return false;
		}

		return userSearchPrefix(search, { exclude: group.members, limit: 30 });
	},

	logoAction() {
		return `/group/${Template.currentData().group._id}/logo`;
	},

	kioskEventURL(group: GroupEntity) {
		return Router.routes.kioskEvents.url({}, { query: { group: group._id } });
	},
	timetableURL(group: GroupEntity) {
		return Router.routes.timetable.url({}, { query: { group: group._id } });
	},
	scheduleURL(group: GroupEntity) {
		return Router.routes.frameSchedule.url({}, { query: { group: group._id } });
	},
	frameEventsURL(group: GroupEntity) {
		return Router.routes.frameEvents.url({}, { query: { group: group._id } });
	},
	frameWeekURL(group: GroupEntity) {
		return Router.routes.frameWeek.url({}, { query: { group: group._id } });
	},
	frameCalendarURL(group: GroupEntity) {
		return Router.routes.frameCalendar.url({}, { query: { group: group._id } });
	},
	frameListURL(group: GroupEntity) {
		return Router.routes.frameCourselist.url({}, { query: { group: group._id } });
	},
});

template.events({
	'keyup .js-search-users'(_event, instance) {
		instance.userSearch.set(instance.$('.js-search-users').val() as string);
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
		const value = elem.val() as string;
		if (value.includes('://')) {
			elem.val(value.split('://')[1]);
		}
	},

	async 'click .js-group-edit-save'(event, instance) {
		event.preventDefault();

		const parentInstance = instance.parentInstance() as any; // Not available in callback

		const url = instance.$('.js-logo-url').val() as string;

		instance.busy('saving');

		const groupId = instance.data.group._id;
		try {
			await GroupsMethods.updateLogo(groupId, url);
			const groupName = Groups.findOne(groupId)?.name;
			Alert.success(
				mf(
					'groupSettings.group.logo.updated',
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
		(instance.parentInstance() as any).editingSettings.set(false);
	},
});
