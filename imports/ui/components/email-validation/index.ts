import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

import './template.html';

{
	const Template = TemplateAny as TemplateStaticTyped<'emailValidation'>;

	const template = Template.emailValidation;

	template.helpers({
		showEmailValidation() {
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
	const Template = TemplateAny as TemplateStaticTyped<'emailValidationModal'>;

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
					i18n('profile.sentVerificationMail', { MAIL: Meteor.user()?.emails[0].address }),
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
