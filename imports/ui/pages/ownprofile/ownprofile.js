import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import Roles from '/imports/api/roles/roles';

import TemplateMixins from '/imports/ui/lib/template-mixins';
import Alert from '/imports/api/alerts/alert';
import { HasRoleUser } from '/imports/utils/course-role-utils';
import Analytics from '/imports/ui/lib/analytics';
import Editable from '/imports/ui/lib/editable';

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
	this.verifyDelete = new ReactiveVar(false);

	this.notificationsUnsubscribeSuccess = () => Router.current().params.query.unsubscribed === 'notifications';
	this.privateMessagesUnsubscribeSuccess = () => Router.current().params.query.unsubscribed === 'privatemessages';
	this.unsubscribeError = () => Router.current().params.query['unsubscribe-error'] === '';

	if (this.notificationsUnsubscribeSuccess()) {
		Analytics.trackEvent('Unsubscribes from notifications', 'Unsubscribes from notifications via e-mail');
	}
	if (this.privateMessagesUnsubscribeSuccess()) {
		Analytics.trackEvent('Unsubscribes from notifications', 'Unsubscribes from private messages via e-mail');
	}

	const instance = this;

	instance.editableName = new Editable(
		true,
		(newName) => {
			Meteor.call('user.updateUsername', newName, (err) => {
				if (err) {
					instance.errors.add(err.error);
				} else {
					Alert.success(mf('profile.updated', 'Updated profile'));
				}
			});
		},
		mf('profile.name.placeholder'),
	);
	instance.editableDescription = new Editable(
		true,
		(newDescription) => {
			Meteor.call('user.updateDescription', newDescription, (err) => {
				if (err) {
					instance.errors.add(err.error);
				} else {
					Alert.success(mf('profile.updated', 'Updated profile'));
				}
			});
		},
		mf('profile.description.placeholder'),
	);

	this.autorun(() => {
		const user = Meteor.user();

		instance.editableName.setText(user.username);
		instance.editableDescription.setText(user.description);
	});
});

Template.profile.helpers({
	changingPass() {
		return Template.instance().changingPass.get();
	},

	verifyDelete() {
		return Template.instance().verifyDelete.get();
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

	privacyChecked() {
		if (this.user.privacy) {
			return 'checked';
		}
		return '';
	},

	isVenueEditor() {
		return this.user.venues.count() > 0;
	},

	roles() {
		return _.clone(Roles).reverse();
	},

	coursesByRole(role) {
		const templateData = Template.instance().data;
		const { involvedIn } = templateData;
		const userID = templateData.user._id;
		const coursesForRole = [];

		involvedIn.forEach((course) => {
			if (HasRoleUser(course.members, role, userID)) {
				coursesForRole.push(course);
			}
		});
		return coursesForRole;
	},

	roleMyList() {
		return `roles.${this.type}.myList`;
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
	noUserName: {
		text: () => mf(
			'warning.noUserName',
			'Please enter a name for your user.',
		),
		field: 'username',
	},
	userExists: {
		text: () => mf(
			'warning.userExists',
			'This username already exists. Please choose another one.',
		),
		field: 'username',
	},
	nameError: {
		text: () => mf(
			'update.username.failed',
			'Failed to update username.',
		),
		field: 'username',
	},
	noEmail: {
		text: () => mf(
			'warning.noEmailProvided',
			'Please enter a email.',
		),
		field: 'email',
	},
	emailNotValid: {
		text: () => mf(
			'warning.emailNotValid',
			'Your email seems to have an error.',
		),
		field: 'email',
	},
	emailExists: {
		text: () => mf(
			'warning.emailExists',
			'This email is already taken.',
		),
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

	'submit .profile-email-form'(event, instance) {
		event.preventDefault();

		Meteor.call('user.updateEmail', instance.$('.js-email').val(), (err) => {
			if (err) {
				instance.errors.add(err.error);
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
				if (!allow) Analytics.trackEvent('Unsubscribes from notifications', 'Unsubscribes from automated notifications via profile');
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
				if (!allow) Analytics.trackEvent('Unsubscribes from notifications', 'Unsubscribes from private messages via profile');
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
						mf(
							'profile.passwordChangeError',
							'Failed to change your password',
						),
					);
				} else {
					Alert.success(mf('profile.passwordChangedSuccess', 'You have changed your password successfully.'));
					instance.changingPass.set(false);
				}
			});
		}
	},
});
