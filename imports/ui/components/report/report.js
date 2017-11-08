import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import ShowServerError from '/imports/ui/lib/show-server-error.js';
import { AddMessage } from '/imports/api/messages/methods.js';

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
					ShowServerError('Your report could not be sent', error);
				} else {
					AddMessage(mf('report.confirm', "Your report was sent. A human will try to find an appropriate solution."), 'success');
				}
				instance.state.set('');
			}
		);
		instance.state.set('sending');
	}
});
