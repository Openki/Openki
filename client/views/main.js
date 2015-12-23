Template.ticker.helpers({
	marquee: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.marquee;
	}
});


/// Introduction

Template.layout.helpers({
	showIntro: function() {
		return Template.instance().showIntro.get();
	}
});

Template.layout.onCreated(function() {
	this.showIntro = new ReactiveVar(Assistant.showIntro());
});

Template.layout.events({
	"click .-toggleIntro": function(event, instance) {
		// When we're not on the homepage we don't handle the event
		if (Router.current().route.options.template != "find") return true;
		event.stopImmediatePropagation();

		// Show or hide the intro
		instance.showIntro.set(!instance.showIntro.get());
		return false
	},

	"click .-closeIntro": function(event, instance) {
		instance.showIntro.set(false);
		Assistant.doneIntro();
	},

	"click .-introContainer": function(event, instance) {
		event.stopImmediatePropagation();
	},

	"click #wrap": function(event, instance) {
		instance.showIntro.set(false);
	}
});
