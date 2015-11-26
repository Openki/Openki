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
	this.showIntro = new ReactiveVar(Session.get("showIntro"));
});

Template.layout.events({
	"click .-toggleIntro": function(event, instance) {
		event.stopImmediatePropagation();
		instance.showIntro.set(!instance.showIntro.get());
		return false
	},
	"click .-introContainer": function(event, instance) {
		event.stopImmediatePropagation();
	},
	"click #wrap": function(event, instance) {
		instance.showIntro.set(false);
	}
});
