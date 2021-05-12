import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import * as Alert from '/imports/api/alerts/alert';

import '/imports/ui/components/buttons/buttons';
import TemplateMixins from '/imports/ui/lib/template-mixins';

import './report.html';

Template.report.onCreated(function reportOnCreated() {
	this.state = new ReactiveVar('');
});
Template.report.helpers({
	reporting: () => Template.instance().state.get() === 'reporting',
	sending: () => Template.instance().state.get() === 'sending',
});

TemplateMixins.FormfieldErrors(Template.report, {
	reportMessage: {
		text: () =>
			mf(
				'report.warning.tooShort',
				'The report message is too short! Please write more than 5 characters.',
			),
		field: 'reportMessage',
	},
});

Template.report.events({
	'click .js-report'(event, instance) {
		event.preventDefault();
		instance.state.set('reporting');
	},

	'click .js-report-cancel'(event, instance) {
		event.preventDefault();
		instance.state.set('');
	},

	'click .js-report-send'(event, instance) {
		event.preventDefault();
		instance.errors.reset();

		const message = instance.$('.js-report-message').val();
		if (!message || message.length <= 5) {
			instance.errors.add('reportMessage');
		}

		if (instance.errors.present()) {
			return;
		}

		Meteor.call(
			'report',
			document.title,
			window.location.href,
			navigator.userAgent,
			message,
			(err) => {
				if (err) {
					Alert.serverError(err, mf('report.notSent', 'Your report could not be sent'));
				} else {
					Alert.success(
						mf(
							'report.confirm',
							'Your report was sent. A human will try to find an appropriate solution.',
						),
					);
				}
				instance.state.set('');
			},
		);
		instance.state.set('sending');
	},
});
