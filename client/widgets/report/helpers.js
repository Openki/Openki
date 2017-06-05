Template.report.onCreated(function() {
	this.state = new ReactiveVar('');
	});

Template.report.helpers({
	reporting: function() { return Template.instance().state.get() == 'reporting'; },
	sending: function() { return Template.instance().state.get() == 'sending'; }
});

Template.report.events({
	'click .js-report': function(event, instance) {
		event.preventDefault();
		instance.state.set('reporting');
	},
	'click .js-report-cancel': function(event, instance) {
		event.preventDefault();
		instance.state.set('');
	},
	'click .js-report-send': function(event, instance) {
		event.preventDefault();
		Meteor.call(
			'report',
			document.title,
			window.location.href,
			navigator.userAgent,
			instance.$('#reportMessage').val(),
			function(error, result) {
				if (error) {
					showServerError('Your report could not be sent', error);
				} else {
					addMessage(mf('report.confirm', "Your report was sent. A human will try to find an appropriate solution."), 'success');
				}
				instance.state.set('');
			}
		);
		instance.state.set('sending');
	}
});
