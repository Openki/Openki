import { mf } from 'meteor/msgfmt:core';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

import './template.html';

{
	const Template = TemplateAny as TemplateStaticTyped<
		Record<string, unknown>,
		'emailValidation',
		Record<string, never>
	>;

	const template = Template.emailValidation;

	template.helpers({
		showEmailValidation() {
			const user = Meteor.user();

			return user && !user.hasEmail();
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		Record<string, unknown>,
		'emailValidationModal',
		Record<string, never>
	>;

	const template = Template.emailValidationModal;

	template.onCreated(function () {
		this.busy(false);
	});

	template.onRendered(function () {
		this.$('.js-email-validation-modal').modal('show');
	});

	template.events({
		async 'click .js-send-validation-email'(event, instance) {
			event.preventDefault();
			instance.busy('sending');
			try {
				await emailMethods.sendVerificationEmail();

				Alert.success(
					mf('profile.sentVerificationMail', { MAIL: Meteor.user()?.emails[0].address }),
				);
				$('.js-email-validation-modal').modal('hide');
			} catch (err) {
				Alert.serverError(err, 'Failed to send verification mail');
			} finally {
				instance.busy(false);
			}
		},
	});
}
