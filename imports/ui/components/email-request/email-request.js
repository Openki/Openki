import { Template } from 'meteor/templating';

import EmailRequest from '/imports/ui/lib/email-request.js';
import { FormfieldErrors } from '/imports/ui/lib/formfield-errors.js';
import { IsEmail } from '/imports/utils/email-tools.js';

import './email-request.html';

Template.emailRequest.helpers({
	showEmailRequest() {
		return EmailRequest.showEmailRequest();
	},
});

Template.emailRequestModal.onCreated(function() {
	this.busy(false);
	FormfieldErrors(this, ['noEmail', 'emailNotValid', 'emailExists']);
});

Template.emailRequestModal.onRendered(function() {
	this.$(".js-email-request-modal").modal('show');
});

Template.emailRequestModal.events({
	'click .js-save-email'(event, instance) {
		instance.busy('saving');
		event.preventDefault();
		Meteor.call('user.updateEmail',
			document.getElementById('registerEmail').value.trim(),
			function(err) {
				instance.busy(false);
				if (err) {
					instance.setError(err.error);
				} else {
					Alert.success(mf('profile.updated', 'Updated profile'));
					instance.$(".js-email-request-modal").modal('hide');
				}
			}
		);
	}
});

Template.emailValidation.helpers({
	showEmailValidation() {
		return EmailRequest.showEmailValidation();
	}
});

Template.emailValidationModal.onCreated(function() {
	this.busy(false);
});

Template.emailValidationModal.onRendered(function() {
	this.$(".js-email-validation-modal").modal('show');
});
Template.emailValidationModal.events({
	'click .js-send-validation-email'(event, instance) {
		instance.busy('sending');
		event.preventDefault();
		Meteor.call('sendVerificationEmail', function(err) {
			instance.busy(false);
			if (err) {
				ShowServerError('Failed to send verification mail', err);
			} else {
				Alert.success(mf('profile.sentVerificationMail'));
				$('.js-email-validation-modal').modal('hide');
			}
		});
	}
});