Router.map(function () {
	this.route('ipTest', {
		path: '/ipTest',
		template: 'ipTest',
	});
});

Template.ipTest.onCreated(function() {
	instance = this;
	instance.result = new ReactiveVar({});
	instance.error = new ReactiveVar(false);

	Meteor.call('closestRegion', false, function(error, result) {
		instance.error.set(error);
		instance.result.set(result);
	});
});


Template.ipTest.helpers({
	result: function() {
		return Template.instance().result.get();
	},

	error: function() {
		return Template.instance().error.get();
	},
});

Template.ipTest.events({
	'submit': function(event, instance) {
		event.preventDefault();
		Meteor.call('closestRegion', instance.$('.js-address').val(), function(error, result) {
			instance.error.set(error);
			instance.result.set(result);
		});
	},
});

