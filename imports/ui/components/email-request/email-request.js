import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import * as Alert from '/imports/api/alerts/alert';
import * as usersMethods from '/imports/api/users/methods';
import * as emailMethods from '/imports/api/emails/methods';

import * as EmailRequest from '/imports/ui/lib/email-request';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';

import './email-request.html';

Template.emailRequest.helpers({
	showEmailRequest() {
		return EmailRequest.showEmailRequest();
	},
});

Template.emailRequestModal.onCreated(function () {
	this.busy(false);
});

Template.emailRequestModal.onRendered(function () {
	this.$('.js-email-request-modal').modal('show');
});

TemplateMixins.FormfieldErrors(Template, 'emailRequestModal', {
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

Template.emailRequestModal.events({
	async 'click .js-save-email'(event, instance) {
		event.preventDefault();

		instance.errors.reset();

		const email = instance.$('.js-email').val().trim();
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
		}
	},
});

Template.emailValidation.helpers({
	showEmailValidation() {
		return EmailRequest.showEmailValidation();
	},
});

Template.emailValidationModal.onCreated(function () {
	this.busy(false);
});

Template.emailValidationModal.onRendered(function () {
	this.$('.js-email-validation-modal').modal('show');
});

Template.emailValidationModal.events({
	async 'click .js-send-validation-email'(event, instance) {
		event.preventDefault();
		instance.busy('sending');
		try {
			await emailMethods.sendVerificationEmail();

			Alert.success(mf('profile.sentVerificationMail', { MAIL: Meteor.user().emails[0].address }));
			$('.js-email-validation-modal').modal('hide');
		} catch (err) {
			Alert.serverError(err, 'Failed to send verification mail');
		} finally {
			instance.busy(false);
		}
	},
});
