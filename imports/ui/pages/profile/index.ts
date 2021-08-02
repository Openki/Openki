import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import { Accounts } from 'meteor/accounts-base';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';
import { ValidationError } from 'meteor/mdg:validation-error';

import * as Alert from '/imports/api/alerts/alert';
import * as usersMethods from '/imports/api/users/methods';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';
import { Analytics } from '/imports/ui/lib/analytics';
import { Editable } from '/imports/ui/lib/editable';
import RouterAutoscroll from '/imports/ui/lib/router-autoscroll';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/groups/list/group-list';
import '/imports/ui/components/profiles/course-list/profile-course-list';
import '/imports/ui/components/profiles/verify-email/verify-email';
import '/imports/ui/components/venues/link/venue-link';
import '/imports/ui/components/avatar/avatar';

import './template.html';
import './styles.scss';

const template = Template.profilePage as Blaze.Template;

TemplateMixins.Expandible(template);

TemplateMixins.FormfieldErrors(template, {
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

type ProfileTemplateInstance = Blaze.TemplateInstance &
	TemplateMixins.ExpandibleTemplateInstance &
	TemplateMixins.FormfieldErrorsTemplateInstance & {
		changingPass: ReactiveVar<boolean>;
		notificationsUnsubscribeSuccess: () => boolean;
		privateMessagesUnsubscribeSuccess: () => boolean;
		unsubscribeError: () => boolean;
		editableName: Editable;
		editableDescription: Editable;
	};

template.onCreated(function () {
	const instance = this as ProfileTemplateInstance;

	instance.busy(false);
	instance.changingPass = new ReactiveVar(false);

	instance.notificationsUnsubscribeSuccess = () =>
		Router.current().params.query.unsubscribed === 'notifications';
	instance.privateMessagesUnsubscribeSuccess = () =>
		Router.current().params.query.unsubscribed === 'privatemessages';
	instance.unsubscribeError = () => Router.current().params.query['unsubscribe-error'] === '';

	if (instance.notificationsUnsubscribeSuccess()) {
		Analytics.trackEvent(
			'Unsubscribes from notifications',
			'Unsubscribes from notifications via e-mail',
		);
	}
	if (instance.privateMessagesUnsubscribeSuccess()) {
		Analytics.trackEvent(
			'Unsubscribes from notifications',
			'Unsubscribes from private messages via e-mail',
		);
	}

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
			usersMethods.updateUsername(newName);
		},
		onSuccess: () => {
			Alert.success(mf('profile.updated', 'Updated profile'));
		},
	});
	instance.editableDescription = new Editable(
		true,
		mf(
			'profile.description.placeholder',
			'About you. Let the community know what your interests are.',
		),
		{
			onSave: async (newDescription) => {
				await usersMethods.updateDescription(newDescription);
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

template.helpers({
	changingPass() {
		const instance = Template.instance() as ProfileTemplateInstance;
		return instance.changingPass.get();
	},

	groupCount() {
		return Template.instance().data.user.groups.count();
	},

	tenantCount() {
		return Template.instance().data.user.tenants.count();
	},

	notificationsChecked() {
		if (Template.instance().data.user.notifications) {
			return 'checked';
		}
		return '';
	},

	allowPrivateMessagesChecked() {
		if (Template.instance().data.user.allowPrivateMessages) {
			return 'checked';
		}
		return '';
	},

	isVenueEditor() {
		return Template.instance().data.user.venues.count() > 0;
	},

	notificationsUnsubscribeSuccess() {
		const instance = Template.instance() as ProfileTemplateInstance;
		return instance.notificationsUnsubscribeSuccess();
	},

	privateMessagesUnsubscribeSuccess() {
		const instance = Template.instance() as ProfileTemplateInstance;
		return instance.privateMessagesUnsubscribeSuccess();
	},

	unsubscribeError() {
		const instance = Template.instance() as ProfileTemplateInstance;
		return instance.unsubscribeError();
	},

	editableName() {
		const instance = Template.instance() as ProfileTemplateInstance;
		return instance.editableName;
	},

	editableDescription() {
		const instance = Template.instance() as ProfileTemplateInstance;
		return instance.editableDescription;
	},
});

template.events({
	'click .js-change-pwd-btn'(_event: any, instance: ProfileTemplateInstance) {
		instance.changingPass.set(true);
		instance.collapse();
	},

	'click .js-change-pwd-cancel'(_event: any, instance: ProfileTemplateInstance) {
		instance.changingPass.set(false);
	},

	'click .js-expand'(_event: any, instance: ProfileTemplateInstance) {
		instance.changingPass.set(false);
	},

	async 'click .js-profile-delete-confirm-btn'(_event: any, instance: ProfileTemplateInstance) {
		instance.busy('deleting');

		instance.collapse(); // Wait for server to log us out.
		try {
			await usersMethods.selfRemove();

			Alert.success(mf('profile.deleted', 'Your account has been deleted'));
		} finally {
			instance.busy(false);
		}
	},

	async 'submit .js-email-form'(event: any, instance: ProfileTemplateInstance) {
		event.preventDefault();
		instance.errors.reset();

		try {
			await usersMethods.updateEmail(instance.$('.js-email').val());
			Alert.success(mf('profile.updated', 'Updated profile'));
		} catch (err) {
			if (ValidationError.is(err)) {
				(err.details as any).forEach((fieldError: any) => {
					instance.errors.add(fieldError.type);
				});
			}
		}
	},

	async 'change .js-notifications'(_event: any, instance: ProfileTemplateInstance) {
		RouterAutoscroll.cancelNext();

		const allow = instance.$('.js-notifications').prop('checked');

		try {
			await usersMethods.updateAutomatedNotification(allow);

			Alert.success(mf('profile.updated', 'Updated profile'));
			if (!allow)
				Analytics.trackEvent(
					'Unsubscribes from notifications',
					'Unsubscribes from automated notifications via profile',
				);
		} catch (err) {
			instance.errors.add(err.error);
		}
	},

	async 'change .js-allowPrivateMessages'(_event: any, instance: ProfileTemplateInstance) {
		RouterAutoscroll.cancelNext();

		const allow = instance.$('.js-allowPrivateMessages').prop('checked');

		try {
			await usersMethods.updatePrivateMessages(allow);

			Alert.success(mf('profile.updated', 'Updated profile'));
			if (!allow)
				Analytics.trackEvent(
					'Unsubscribes from notifications',
					'Unsubscribes from private messages via profile',
				);
		} catch (err) {
			instance.errors.add(err.error);
		}
	},

	'submit .js-change-pwd'(event: any, instance: ProfileTemplateInstance) {
		event.preventDefault();
		const old = (instance.find('.js-old-pwd') as HTMLInputElement).value;
		const pass = (instance.find('.js-new-pwd') as HTMLInputElement).value;
		if (pass !== '') {
			if (pass !== (instance.find('.js-new-pwd-confirm') as HTMLInputElement).value) {
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
