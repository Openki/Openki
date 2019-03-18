import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import Groups from '/imports/api/groups/groups.js';

import UserSearchPrefix from '/imports/utils/user-search-prefix.js';
import Alert from '/imports/api/alerts/alert.js';
import TemplateMixins from '/imports/ui/lib/template-mixins.js';

import '/imports/ui/components/buttons/buttons.js';

import './group-settings.html';

Template.groupSettings.onCreated(function() {
	var instance = this;

	console.log(instance.data.group);

	//strip https:// from logoUrl and bgUrl because its already labeled as prefix
	const logoUrl = instance.data.group.logoUrl;
	if ( logoUrl.startsWith('https://') ) {
		instance.data.group.logoUrl = logoUrl.replace('https://', '');
	}
	const backgroundUrl = instance.data.group.backgroundUrl;
	if ( backgroundUrl.startsWith('https://') ) {
		instance.data.group.backgroundUrl = backgroundUrl.replace('https://', '');
	}

	instance.busy(false);

	instance.userSearch = new ReactiveVar('');

	instance.autorun(function() {
		var search = instance.userSearch.get();
		if (search.length > 0) {
			Meteor.subscribe('userSearch', search);
		}
	});
});

TemplateMixins.FormfieldErrors(Template.groupSettings, {
	'logo url is not valid': {
		text: () => mf(
			'group.settings.error.url.invalid',
			'this url is not valid.'
		),
		field: "logoUrl"
	},

	'bg url is not valid': {
		text: () => mf(
			'group.settings.error.url.invalid',
			'this url is not valid.'
		),
		field: "backgroundUrl"
	},
});

Template.groupSettings.helpers({
	foundUsers() {
		var instance = Template.instance();

		var search = instance.userSearch.get();
		if (search === '') return false;

		var group = Groups.findOne(Router.current().params._id);
		return UserSearchPrefix(search, { exclude: group.members, limit: 30 });
	},

	kioskEventURL() {
		return Router.routes.kioskEvents.url({}, { query: {group: this._id} });
	},
	timetableURL() {
		return Router.routes.timetable.url({}, { query: {group: this._id} });
	},
	scheduleURL() {
	return Router.routes.frameSchedule.url({}, { query: {group: this._id} });
	},
	frameEventsURL() {
		return Router.routes.frameEvents.url({}, { query: {group: this._id} });
	},
	frameWeekURL() {
		return Router.routes.frameWeek.url({}, { query: {group: this._id} });
	},
	frameCalendarURL() {
		return Router.routes.frameCalendar.url({}, { query: {group: this._id} });
	},
	frameListURL() {
		return Router.routes.frameCourselist.url({}, { query: {group: this._id} });
	},
});

Template.groupSettings.events({
	'keyup .js-search-users'(event, instance) {
		instance.userSearch.set(instance.$('.js-search-users').val());
	},

	'click .js-member-add-btn'(event, instance) {
		var memberId = this._id;
		var groupId = Router.current().params._id;
		Meteor.call("group.updateMembership", memberId, groupId, true, function(err) {
			if (err) {
				Alert.error(err, 'Could not add member');
			} else {
				const memberName = Meteor.users.findOne(memberId).username;
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'groupSettings.memberAdded',
					{ MEMBER: memberName, GROUP: groupName },
					'"{MEMBER}" has been added as a member to the group "{GROUP}"'
				));
			}
		});
	},

	'click .js-member-remove-btn'(event, instance) {
		var memberId = ''+this;
		var groupId = Router.current().params._id;
		Meteor.call("group.updateMembership", memberId, groupId, false, function(err) {
			if (err) {
				Alert.error(err, 'Could not remove member');
			} else {
				const memberName = Meteor.users.findOne(memberId).username;
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'groupSettings.memberRemoved',
					{ MEMBER: memberName, GROUP: groupName },
					'"{MEMBER}" has been removed from to the group "{GROUP}"'
				));
			}
		});
	},

	'click .js-group-edit-save'(event, instance) {
		event.preventDefault();
		instance.errors.reset();

		var parentInstance = instance.parentInstance(); // Not available in callback

		instance.busy('saving');
		const changes = {
			logoUrl: instance.$('.js-logo-url').val(),
			backgroundUrl: instance.$('.js-background-url').val()
		};

		const groupId = instance.data.group._id;
		Meteor.call("group.save", groupId, changes, function(err) {
			instance.busy(false);
			if (err) {
				instance.errors.add(err.reason);
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'groupSettings.groupChangesSaved',
					{ GROUP: groupName },
					'Your changes to the settings of the group "{GROUP}" have been saved.'
				));
				parentInstance.editingSettings.set(false);
			}
		});
	},

	'click .js-group-edit-cancel'(event, instance) {
		instance.parentInstance().editingSettings.set(false);
	}
});
