import { mf } from 'meteor/msgfmt:core';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import * as Alert from '/imports/api/alerts/alert';
import * as usersMethods from '/imports/api/users/methods';

import * as TemplateMixins from '/imports/ui/lib/template-mixins';

import './template.html';

{
	const Template = TemplateAny as TemplateStaticTyped<
		Record<string, unknown>,
		'emailRequest',
		Record<string, never>
	>;

	const template = Template.emailRequest;

	template.helpers({
		showEmailRequest() {
			const user = Meteor.user();

			return (
				user &&
				user.hasEmail() &&
				!user.hasVerifiedEmail() &&
				moment().subtract(7, 'days').isAfter(user.createdAt)
			);
		},
	});
}

{
	const TemplateBase = TemplateAny as TemplateStaticTyped<
		Record<string, unknown>,
		'emailRequestModal',
		Record<string, never>
	>;

	const Template = TemplateMixins.FormfieldErrors(TemplateBase, 'emailRequestModal', {
		noEmail: {
			text: () => mf('register.warning.noEmailProvided'),
			field: 'email',
		},
		'email invalid': {
			text: () => mf('register.warning.emailNotValid', 'Your email seems to have an error.'),
			field: 'email',
		},
		emailExists: {
			text: () => mf('register.warning.emailExists'),
			field: 'email',
		},
	});

	const template = Template.emailRequestModal;

	template.onCreated(function () {
		this.busy(false);
	});

	template.onRendered(function () {
		this.$('.js-email-request-modal').modal('show');
	});

	template.events({
		async 'click .js-save-email'(event, instance) {
			event.preventDefault();

			instance.errors.reset();

			const email = (instance.$('.js-email').val() as string).trim();
			if (!email) {
				instance.errors.add('noEmail');
			}

			if (instance.errors.present()) {
				return;
			}

			instance.busy('saving');
			try {
				await usersMethods.updateEmail(email);

				Alert.success(mf('profile.updated', 'Updated profile'));
				instance.$('.js-email-request-modal').modal('hide');
			} catch (err) {
				instance.errors.add(err.reason);
			} finally {
				instance.busy(false);
			}
		},
	});
}
