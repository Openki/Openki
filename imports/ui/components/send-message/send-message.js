import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';

import Alert from '/imports/api/alerts/alert.js';

import PleaseLogin from '/imports/ui/lib/please-login.js';

import '../profiles/verify-email/verify-email.js';

import './send-message.html';

Template.sendMessage.onCreated(function() {
	this.busy(false);
	this.state = new ReactiveDict();
	this.state.setDefault(
		{ message: ''
		, revealAddress: false
		, sendCopy: false
		, verificationMailSent: false }
	);
});

Template.sendMessage.onRendered(function() {
	this.$('.js-email-message').select();
});

Template.sendMessage.helpers({
	hasEmail() {
		const user = Meteor.user();
		if (!user) return false;

		const emails = user.emails;
		return emails && emails[0];
	},

	hasVerifiedEmail() {
		return Meteor.user().emails[0].verified;
	},
});

Template.sendMessage.events({
	'click .js-verify-mail'(event, instance) {
		instance.state.set('verificationMailSent', true);
		Meteor.call('sendVerificationEmail', function(err) {
			if (err) {
				instance.state.set('verificationMailSent', false);
				Alert.error(err, 'Failed to send verification mail');
			} else {
				Alert.success(mf('profile.sentVerificationMail'));
			}
		});
	},

	'keyup .js-email-message'(event, instance) {
		const message = instance.$(event.currentTarget).val();
		instance.state.set({ message });
	},

	'change input[type="checkbox"]'(event, instance) {
		const target = instance.$(event.currentTarget);
		instance.state.set(target.attr('name'), target.prop('checked'));
	},

	'submit .js-send-message'(event, instance) {
		event.preventDefault();
		instance.busy('sending');

		if (PleaseLogin()) return;

		const state = instance.state;
		const message = state.get('message');

		if (message.length < 2) {
			alert(mf('profile.mail.longertext', 'longer text please'));
			instance.busy(false);
			return;
		}

		const options =
			{ revealAddress: state.get('revealAddress')
			, sendCopy: state.get('sendCopy')
			};

		const data = Template.currentData();
		if (data.courseId) options.courseId = data.courseId;

		if (data.eventId) options.eventId = data.eventId;

		Meteor.call('sendEmail', data.recipientId, message,	options, (err) => {
				instance.busy(false);
				if (err) {
					Alert.error(err, 'danger');
				} else {
					Alert.success(mf('profile.mail.sent', 'Your message was sent'));
					instance.state.set('message', '');

					const parentState = instance.parentInstance().state;
					if (parentState) parentState.set('messageSent', true);
				}
			}
		);
	}
});
