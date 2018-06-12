import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import AlertMessages from '/imports/api/alert-messages/alert-messages.js';

import '/imports/ui/components/buttons/buttons.js';

import './report.html';

Template.report.onCreated(function reportOnCreated() {
	this.state = new ReactiveVar('');
});
Template.report.helpers({

	reporting: () => Template.instance().state.get() == 'reporting',
	sending: () => Template.instance().state.get() == 'sending'
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
		Meteor.call(
			'report',
			document.title,
			window.location.href,
			navigator.userAgent,
			instance.$('#reportMessage').val(),
			function(error, result) {
				if (error) {
					AlertMessages.add('error', error, 'Your report could not be sent');
				} else {
					AlertMessages.add('success', mf('report.confirm', "Your report was sent. A human will try to find an appropriate solution."));
				}
				instance.state.set('');
			}
		);
		instance.state.set('sending');
	}
});
