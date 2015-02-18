Template.report.created = function() {
	this.state = new ReactiveVar('');
}

Template.report.helpers({
	reporting: function() { return Template.instance().state.get() == 'reporting'; },
	sending: function() { return Template.instance().state.get() == 'sending'; },
	confirm: function() { return Template.instance().state.get() == 'confirm'; },
	error: function() { return Template.instance().state.get() == 'error'; }
});

Template.report.events({
	'click .open': function(event, instance) {
		instance.state.set('reporting');
	},
	'click .cancel': function(event, instance) {
		instance.state.set('');
	},
	'click .send': function(event, instance) {
		Meteor.call('report', document.title, window.location.href, instance.$('.report').val(), function(error, result) {
			if (error) {
				instance.state.set('error');
			} else {
				instance.state.set('confirm');
			}
		});
		instance.state.set('sending');
	}
});

