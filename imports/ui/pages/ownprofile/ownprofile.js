import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';

import TemplateMixins from '/imports/ui/lib/template-mixins';
import * as Alert from '/imports/api/alerts/alert';
import { Analytics } from '/imports/ui/lib/analytics';
import { Editable } from '/imports/ui/lib/editable';
import { MeteorAsync } from '/imports/utils/promisify';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/groups/list/group-list';
import '/imports/ui/components/profiles/course-list/profile-course-list';
import '/imports/ui/components/profiles/verify-email/verify-email';
import '/imports/ui/components/venues/link/venue-link';
import '/imports/ui/components/avatar/avatar';

import './ownprofile.html';

TemplateMixins.Expandible(Template.profile);
Template.profile.onCreated(function () {
	this.busy(false);
	this.changingPass = new ReactiveVar(false);

	this.notificationsUnsubscribeSuccess = () =>
		Router.current().params.query.unsubscribed === 'notifications';
	this.privateMessagesUnsubscribeSuccess = () =>
		Router.current().params.query.unsubscribed === 'privatemessages';
	this.unsubscribeError = () => Router.current().params.query['unsubscribe-error'] === '';

	if (this.notificationsUnsubscribeSuccess()) {
		Analytics.trackEvent(
			'Unsubscribes from notifications',
			'Unsubscribes from notifications via e-mail',
		);
	}
	if (this.privateMessagesUnsubscribeSuccess()) {
		Analytics.trackEvent(
			'Unsubscribes from notifications',
			'Unsubscribes from private messages via e-mail',
		);
	}

	const instance = this;

	instance.editableName = new Editable(true, mf('profile.name.placeholder', 'Username'), {
		serverValidationErrors: [
			{
				type: 'noUserName',
				message: () => mf('warning.noUserName', 'Please enter a name for your user.'),
			},
			{
				type: 'userExists',
				message: () =>
					mf('warning.userExists', 'This username already exists. Please choose another one.'),
			},
			{
				type: 'nameError',
				message: () => mf('update.username.failed', 'Failed to update username.'),
			},
		],
		onSave: async (newName) => {
			await MeteorAsync.callAsync('user.updateUsername', newName);
		},
		onSuccess: () => {
			Alert.success(mf('profile.updated', 'Updated profile'));
		},
	});
	instance.editableDescription = new Editable(
		true,
		mf(
			'profile.description.placeholder',
			'About me, my interests and skills. (How about the idea of creating courses fitting to your description? 😉)',
		),
		{
			onSave: async (newDescription) => {
				await MeteorAsync.callAsync('user.updateDescription', newDescription);
			},
			onSuccess: () => {
				Alert.success(mf('profile.updated', 'Updated profile'));
			},
		},
	);

	this.autorun(() => {
		const user = Meteor.user();

		instance.editableName.setText(user?.username || '');
		instance.editableDescription.setText(user?.description || '');
	});
});

Template.profile.helpers({
	changingPass() {
		return Template.instance().changingPass.get();
	},

	groupCount() {
		return this.user.groups.count();
	},

	notificationsChecked() {
		if (this.user.notifications) {
			return 'checked';
		}
		return '';
	},

	allowPrivateMessagesChecked() {
		if (this.user.allowPrivateMessages) {
			return 'checked';
		}
		return '';
	},

	isVenueEditor() {
		return this.user.venues.count() > 0;
	},

	notificationsUnsubscribeSuccess() {
		return Template.instance().notificationsUnsubscribeSuccess();
	},

	privateMessagesUnsubscribeSuccess() {
		return Template.instance().privateMessagesUnsubscribeSuccess();
	},

	unsubscribeError() {
		return Template.instance().unsubscribeError();
	},

	editableName() {
		return Template.instance().editableName;
	},

	editableDescription() {
		return Template.instance().editableDescription;
	},
});

TemplateMixins.FormfieldErrors(Template.profile, {
	noEmail: {
		text: () => mf('warning.noEmailProvided', 'Please enter a email.'),
		field: 'email',
	},
	emailNotValid: {
		text: () => mf('warning.emailNotValid', 'Your email seems to have an error.'),
		field: 'email',
	},
	emailExists: {
		text: () => mf('warning.emailExists', 'This email is already taken.'),
		field: 'email',
	},
});

Template.profile.events({
	'click .js-change-pwd-btn'(event, instance) {
		instance.changingPass.set(true);
		instance.collapse();
	},

	'click .js-change-pwd-cancel'(event, instance) {
		instance.changingPass.set(false);
	},

	'click .js-expand'(event, instance) {
		instance.changingPass.set(false);
	},

	'click .js-profile-delete-confirm-btn'(event, instance) {
		instance.busy('deleting');
		Meteor.call('user.self.remove', () => {
			instance.busy(false);
			Alert.success(mf('profile.deleted', 'Your account has been deleted'));
		});
		instance.collapse(); // Wait for server to log us out.
	},

	'submit .js-email-form'(event, instance) {
		event.preventDefault();
		instance.errors.reset();

		Meteor.call('user.updateEmail', instance.$('.js-email').val(), (err) => {
			if (err) {
				if (err.error === 'validation-error') {
					err.details.forEach((fieldError) => {
						instance.errors.add(fieldError.type);
					});
				}
			} else {
				Alert.success(mf('profile.updated', 'Updated profile'));
			}
		});
	},

	'change .js-notifications'(event, instance) {
		const allow = instance.$('.js-notifications').prop('checked');

		Meteor.call('user.updateAutomatedNotification', allow, (err) => {
			if (err) {
				instance.errors.add(err.error);
			} else {
				Alert.success(mf('profile.updated', 'Updated profile'));
				if (!allow)
					Analytics.trackEvent(
						'Unsubscribes from notifications',
						'Unsubscribes from automated notifications via profile',
					);
			}
		});
	},

	'change .js-allowPrivateMessages'(event, instance) {
		const allow = instance.$('.js-allowPrivateMessages').prop('checked');

		Meteor.call('user.updatePrivateMessages', allow, (err) => {
			if (err) {
				instance.errors.add(err.error);
			} else {
				Alert.success(mf('profile.updated', 'Updated profile'));
				if (!allow)
					Analytics.trackEvent(
						'Unsubscribes from notifications',
						'Unsubscribes from private messages via profile',
					);
			}
		});
	},

	'submit .js-change-pwd'(event, instance) {
		event.preventDefault();
		const old = document.querySelector('.js-old-pwd').value;
		const pass = document.querySelector('.js-new-pwd').value;
		if (pass !== '') {
			if (pass !== document.querySelector('.js-new-pwd-confirm').value) {
				Alert.warning(mf('profile.passwordMismatch', "Sorry, Your new passwords don't match"));
				return;
			}
			const minLength = 5; // We've got _some_ standards
			if (pass.length < minLength) {
				Alert.warning(mf('profile.passwordShort', 'Your desired password is too short, sorry.'));
				return;
			}
			Accounts.changePassword(old, pass, (err) => {
				if (err) {
					Alert.serverError(
						err,
						mf('profile.passwordChangeError', 'Failed to change your password'),
					);
				} else {
					Alert.success(
						mf('profile.passwordChangedSuccess', 'You have changed your password successfully.'),
					);
					instance.changingPass.set(false);
				}
			});
		}
	},
});
