import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert';

import EmailRequest from '/imports/ui/lib/email-request';
import TemplateMixins from '/imports/ui/lib/template-mixins';

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

TemplateMixins.FormfieldErrors(Template.emailRequestModal, {
	noEmail: {
		text: () => mf(
			'register.warning.noEmailProvided',
			'Please enter an email to register.',
		),
		field: 'email',
	},
	'email invalid': {
		text: () => mf(
			'register.warning.emailNotValid',
			'Your email seems to have an error.',
		),
		field: 'email',
	},
	emailExists: {
		text: () => mf(
			'register.warning.emailExists',
			'This email already exists. Is this your second account?',
		),
		field: 'email',
	},
});

Template.emailRequestModal.events({
	'click .js-save-email'(event, instance) {
		event.preventDefault();

		instance.errors.reset();

		const email = instance.$('.js-email').val().trim();
		if (!email) {
			instance.errors.add('noEmail');
		}

		if (instance.errors.present()) return;

		instance.busy('saving');
		Meteor.call('user.updateEmail', email, (err) => {
			instance.busy(false);
			if (err) {
				instance.errors.add(err.reason);
			} else {
				Alert.success(mf('profile.updated', 'Updated profile'));
				instance.$('.js-email-request-modal').modal('hide');
			}
		});
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
	'click .js-send-validation-email'(event, instance) {
		instance.busy('sending');
		event.preventDefault();
		Meteor.call('sendVerificationEmail', (err) => {
			instance.busy(false);
			if (err) {
				ShowServerError('Failed to send verification mail', err);
			} else {
				Alert.success(mf('profile.sentVerificationMail'));
				$('.js-email-validation-modal').modal('hide');
			}
		});
	},
});
