import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import { Users } from '/imports/api/users/users';
import * as usersMethods from '/imports/api/users/methods';
import * as Alert from '/imports/api/alerts/alert';

import { PublicSettings } from '/imports/utils/PublicSettings';

import './avatar.html';

Template.avatar.onCreated(function () {
	const data = this.data;

	if (data.color !== undefined) {
		return;
	}

	if (data.userId !== undefined) {
		this.subscribe('user', data.userId);
	}
});

Template.avatar.helpers({
	color() {
		const data = Template.currentData();

		// the form sets the color directly
		if (data.color !== undefined) return data.color;

		// otherwise get the color from a user
		const user = Users.findOne(data.userId || Meteor.userId());
		const color = user?.avatar?.color;

		if (color === undefined) {
			return 0;
		}

		return color;
	},

	class() {
		return Template.currentData().class || '';
	},

	alt() {
		return PublicSettings.avatarLogo.alt;
	},

	avatarLogo() {
		return PublicSettings.avatarLogo.src;
	},
});

Template.avatarForm.onCreated(function () {
	this.tempColor = new ReactiveVar(Meteor.user().avatar?.color || 0);
});

Template.avatarForm.onRendered(() => {
	$('#avatarColorRange').val(Template.instance().tempColor.get());
});

Template.avatarForm.helpers({
	color() {
		return Template.instance().tempColor.get();
	},
});

Template.avatarForm.events({
	'input .js-change-avatar-color'(event, instance) {
		instance.tempColor.set(event.target.value);
	},

	async 'change .js-change-avatar-color'(event, instance) {
		const newColor = Number(instance.tempColor.get());

		// only update the color if it has changed
		if (Meteor.user().avatar?.color === newColor) {
			return;
		}

		await usersMethods.updateAvatarColor(newColor);

		Alert.success(i18n('profile.updated', 'Updated profile'));
	},
});
