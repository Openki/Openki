import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import * as emailMethods from '/imports/api/emails/methods';

import { PleaseLogin } from '/imports/ui/lib/please-login';

import '../profiles/verify-email/verify-email';

import './send-message.html';

Template.sendMessage.onCreated(function () {
	this.busy(false);
	this.state = new ReactiveDict();
	this.state.setDefault({
		revealAddress: false,
		sendCopy: false,
		verificationMailSent: false,
	});
});

Template.sendMessage.onRendered(function () {
	this.$('.js-email-message').trigger('select');
});

Template.sendMessage.helpers({
	hasEmail() {
		return Meteor.user()?.hasEmail() || false;
	},

	hasVerifiedEmail() {
		return Meteor.user()?.hasVerifiedEmail() || false;
	},
});

Template.sendMessage.events({
	async 'click .js-verify-mail'(event, instance) {
		instance.state.set('verificationMailSent', true);

		try {
			await emailMethods.sendVerificationEmail();

			Alert.success(mf('profile.sentVerificationMail', { MAIL: Meteor.user().emails[0].address }));
		} catch (err) {
			instance.state.set('verificationMailSent', false);
			Alert.serverError(
				err,
				mf('profile.sendVerificationMailFailed', 'Failed to send verification mail'),
			);
		}
	},

	'change input[type="checkbox"]'(event, instance) {
		const target = instance.$(event.currentTarget);
		instance.state.set(target.attr('name'), target.prop('checked'));
	},

	async 'submit .js-send-message'(event, instance) {
		event.preventDefault();
		instance.busy('sending');

		if (PleaseLogin()) {
			return;
		}

		const { state } = instance;
		const message = instance.$('.js-email-message').val();

		if (message.length < 2) {
			Alert.error(mf('profile.mail.longertext', 'longer text please'));
			instance.busy(false);
			return;
		}

		const options = {
			revealAddress: state.get('revealAddress'),
			sendCopy: state.get('sendCopy'),
		};

		const data = Template.currentData();
		if (data.courseId) {
			options.courseId = data.courseId;
		}

		if (data.eventId) {
			options.eventId = data.eventId;
		}

		try {
			await emailMethods.sendEmail(data.recipientId, message, options);
			Alert.success(mf('profile.mail.sent', 'Your message was sent'));
			instance.$('.js-email-message').val('');
			if (data.onDone) {
				data.onDone();
			}
		} catch (err) {
			Alert.serverError(err, mf('profile.mail.sendFailed', 'Your message was not sent'));
		} finally {
			instance.busy(false);
		}
	},
});
