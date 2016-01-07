Template.layout.onCreated(function() {
	this.showIntro = new ReactiveVar(Assistant.showIntro());
	this.openedIntro = new ReactiveVar(true);
});


Template.layout.helpers({
	showIntro: function() {
		return Template.instance().showIntro.get();
	}
});

Template.introduction.helpers({
	openedIntro: function() {
		return Template.instance().parentInstance().openedIntro.get();
	}
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
	},

	"click .-toggleDetails": function(event, instance) {
		instance.openedIntro.set(!instance.openedIntro.get());
		if (instance.openedIntro.get()) {
			instance.$('.content').slideDown(400)
		} else {
			instance.$('.content').slideUp(400)
		}
	}
});
