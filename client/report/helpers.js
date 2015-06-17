Template.report.created = function() {
	this.state = new ReactiveVar('');
}

Template.report.helpers({
	reporting: function() { return Template.instance().state.get() == 'reporting'; },
	sending: function() { return Template.instance().state.get() == 'sending'; }
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
				addMessage(mf('report.error', "Your report could not be sent. I'd feel sorry for you but I'm just a programmed response."), 'danger');
			} else {
				addMessage(mf('report.confirm', "Your report was sent. A human will try to find an appropriate solution."), 'success');
			}
			instance.state.set('');
		});
		instance.state.set('sending');
	}
});

