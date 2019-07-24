import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import Alert from '/imports/api/alerts/alert';

import '/imports/ui/components/buttons/buttons';

import './report.html';

Template.report.onCreated(function reportOnCreated() {
	this.state = new ReactiveVar('');
});
Template.report.helpers({

	reporting: () => Template.instance().state.get() === 'reporting',
	sending: () => Template.instance().state.get() === 'sending',
});

Template.report.events({
	'click .js-report': function (event, instance) {
		event.preventDefault();
		instance.state.set('reporting');
	},

	'click .js-report-cancel': function (event, instance) {
		event.preventDefault();
		instance.state.set('');
	},

	'click .js-report-send': function (event, instance) {
		event.preventDefault();
		Meteor.call(
			'report',
			document.title,
			window.location.href,
			navigator.userAgent,
			instance.$('#reportMessage').val(),
			(error) => {
				if (error) {
					Alert.error(error, 'Your report could not be sent');
				} else {
					Alert.success(mf('report.confirm', 'Your report was sent. A human will try to find an appropriate solution.'));
				}
				instance.state.set('');
			},
		);
		instance.state.set('sending');
	},
});
