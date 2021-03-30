import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import { Users } from '/imports/api/users/users';
import { Alert } from '/imports/api/alerts/alert';

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
		return Meteor.settings.public.avatarLogo.alt;
	},

	avatarLogo() {
		return Meteor.settings.public.avatarLogo.src;
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

	'change .js-change-avatar-color'(event, instance) {
		const newColor = Number(instance.tempColor.get());

		// only update the color if it has changed
		if (Meteor.user().avatar?.color === newColor) {
			return;
		}

		Meteor.call('user.updateAvatarColor', newColor, (err) => {
			if (!err) {
				Alert.success(mf('profile.updated', 'Updated profile'));
			}
		});
	},
});
