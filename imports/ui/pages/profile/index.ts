import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
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
import '/imports/ui/components/profiles/verify-email';
import '/imports/ui/components/venues/link/venue-link';
import '/imports/ui/components/avatar/avatar';
import { VenueEntity, VenueModel } from '/imports/api/venues/venues';
import { TenantEntity, TenantModel } from '/imports/api/tenants/tenants';
import { GroupEntity } from '/imports/api/groups/groups';

import './template.html';
import './styles.scss';

export interface ProfilePageData {
	user: {
		_id: string;
		name: string;
		notifications: boolean;
		allowPrivateMessages: boolean;
		tenants: Mongo.Cursor<TenantEntity, TenantModel>;
		groups: Mongo.Cursor<GroupEntity>;
		venues: Mongo.Cursor<VenueEntity, VenueModel>;
		email: string;
		verified: boolean;
	};
}

const TemplateBase = TemplateAny as TemplateStaticTyped<
	ProfilePageData,
	'profilePage',
	{
		changingPass: ReactiveVar<boolean>;
		notificationsUnsubscribeSuccess: () => boolean;
		privateMessagesUnsubscribeSuccess: () => boolean;
		unsubscribeError: () => boolean;
		editableName: Editable;
		editableDescription: Editable;
	}
>;

// Add Expandible an FormfieldError Handling to the profilePage Template

const TemplateExtended = TemplateMixins.Expandible(TemplateBase, 'profilePage');

const Template = TemplateMixins.FormfieldErrors(TemplateExtended, 'profilePage', {
	noEmail: {
		text: () => i18n('warning.noEmailProvided', 'Please enter a email.'),
		field: 'email',
	},
	emailNotValid: {
		text: () => i18n('warning.emailNotValid', 'Your email seems to have an error.'),
		field: 'email',
	},
	emailExists: {
		text: () => i18n('warning.emailExists', 'This email is already taken.'),
		field: 'email',
	},
});

const template = Template.profilePage;

template.onCreated(function () {
	const instance = this;

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

	instance.editableName = new Editable(true, i18n('profile.name.placeholder', 'Username'), {
		serverValidationErrors: [
			{
				type: 'noUserName',
				message: () => i18n('warning.noUserName', 'Please enter a name for your user.'),
			},
			{
				type: 'userExists',
				message: () =>
					i18n('warning.userExists', 'This username already exists. Please choose another one.'),
			},
			{
				type: 'nameError',
				message: () => i18n('update.username.failed', 'Failed to update username.'),
			},
		],
		onSave: async (newName) => {
			usersMethods.updateUsername(newName);
		},
		onSuccess: () => {
			Alert.success(i18n('profile.updated', 'Updated profile'));
		},
	});
	instance.editableDescription = new Editable(
		true,
		i18n(
			'profile.description.placeholder',
			'About you. Let the community know what your interests are.',
		),
		{
			onSave: async (newDescription) => {
				await usersMethods.updateDescription(newDescription);
			},
			onSuccess: () => {
				Alert.success(i18n('profile.updated', 'Updated profile'));
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
		return Template.instance().changingPass.get();
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

template.events({
	'click .js-change-pwd-btn'(_event, instance) {
		instance.changingPass.set(true);
		instance.collapse();
	},

	'click .js-change-pwd-cancel'(_event, instance) {
		instance.changingPass.set(false);
	},

	'click .js-expand'(_event, instance) {
		instance.changingPass.set(false);
	},

	async 'click .js-profile-delete-confirm-btn'(_event, instance) {
		instance.busy('deleting');

		instance.collapse(); // Wait for server to log us out.
		try {
			await usersMethods.selfRemove();

			Alert.success(i18n('profile.deleted', 'Your account has been deleted'));
		} finally {
			instance.busy(false);
		}
	},

	async 'submit .js-email-form'(event, instance) {
		event.preventDefault();
		instance.errors.reset();

		try {
			await usersMethods.updateEmail(instance.$('.js-email').val() as string);
			Alert.success(i18n('profile.updated', 'Updated profile'));
		} catch (err) {
			if (ValidationError.is(err)) {
				(err.details as any).forEach((fieldError: any) => {
					instance.errors.add(fieldError.type);
				});
			}
		}
	},

	async 'change .js-notifications'(_event, instance) {
		RouterAutoscroll.cancelNext();

		const allow = instance.$('.js-notifications').prop('checked');

		try {
			await usersMethods.updateAutomatedNotification(allow);

			Alert.success(i18n('profile.updated', 'Updated profile'));
			if (!allow)
				Analytics.trackEvent(
					'Unsubscribes from notifications',
					'Unsubscribes from automated notifications via profile',
				);
		} catch (err) {
			instance.errors.add(err.error);
		}
	},

	async 'change .js-allowPrivateMessages'(_event, instance) {
		RouterAutoscroll.cancelNext();

		const allow = instance.$('.js-allowPrivateMessages').prop('checked');

		try {
			await usersMethods.updatePrivateMessages(allow);

			Alert.success(i18n('profile.updated', 'Updated profile'));
			if (!allow)
				Analytics.trackEvent(
					'Unsubscribes from notifications',
					'Unsubscribes from private messages via profile',
				);
		} catch (err) {
			instance.errors.add(err.error);
		}
	},

	'submit .js-change-pwd'(event, instance) {
		event.preventDefault();
		const old = (instance.find('.js-old-pwd') as HTMLInputElement).value;
		const pass = (instance.find('.js-new-pwd') as HTMLInputElement).value;
		if (pass !== '') {
			if (pass !== (instance.find('.js-new-pwd-confirm') as HTMLInputElement).value) {
				Alert.warning(i18n('profile.passwordMismatch', "Sorry, Your new passwords don't match"));
				return;
			}
			const minLength = 5; // We've got _some_ standards
			if (pass.length < minLength) {
				Alert.warning(i18n('profile.passwordShort', 'Your desired password is too short, sorry.'));
				return;
			}
			Accounts.changePassword(old, pass, (err) => {
				if (err) {
					Alert.serverError(
						err,
						i18n('profile.passwordChangeError', 'Failed to change your password'),
					);
				} else {
					Alert.success(
						i18n('profile.passwordChangedSuccess', 'You have changed your password successfully.'),
					);
					instance.changingPass.set(false);
				}
			});
		}
	},
});
