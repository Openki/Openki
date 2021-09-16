import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { GroupModel, GroupEntity, Groups } from '/imports/api/groups/groups';
import * as GroupsMethods from '/imports/api/groups/methods';
import { Users } from '/imports/api/users/users';

import { userSearchPrefix } from '/imports/utils/user-search-prefix';
import { MeteorAsync } from '/imports/utils/promisify';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/editable-image';
import type { UploadImage, Data as EditableImageData } from '/imports/ui/components/editable-image';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	{
		group: GroupModel | (Partial<GroupEntity> & { _id: 'create' });
	},
	'groupSettings',
	{ userSearch: ReactiveVar<string> }
>;

const template = Template.groupSettings;

template.onCreated(function () {
	const instance = this;

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

	logoFileUploadArgs(): EditableImageData {
		const instance = Template.instance();
		return {
			thumbnail: (instance.data.group as any)?.publicLogoUrl?.(),
			maxSize: 100,
			async onUpload(file: UploadImage) {
				const parentInstance = instance.parentInstance() as any; // Not available in callback

				instance.busy('saving');

				const groupId = instance.data.group._id;
				try {
					await GroupsMethods.updateLogo(groupId, file);
					const groupName = Groups.findOne(groupId)?.name;
					Alert.success(
						i18n(
							'groupSettings.group.logo.updated',
							'Your changes to the settings of the group "{GROUP}" have been saved.',
							{ GROUP: groupName },
						),
					);
					parentInstance.editingSettings.set(false);
				} catch (err) {
					Alert.serverError(err, 'Could not save settings');
				} finally {
					instance.busy(false);
				}
			},
		};
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
				i18n(
					'groupSettings.memberAdded',
					'"{MEMBER}" has been added as a member to the group "{GROUP}"',
					{ MEMBER: memberName, GROUP: groupName },
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
				i18n(
					'groupSettings.memberRemoved',
					'"{MEMBER}" has been removed from to the group "{GROUP}"',
					{ MEMBER: memberName, GROUP: groupName },
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Could not remove member');
		}
	},

	'click .js-group-edit-cancel'(_event, instance) {
		(instance.parentInstance() as any).editingSettings.set(false);
	},
});
