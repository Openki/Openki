Template.layout.helpers({
	showIntro: function() {
		return Template.instance().showIntro.get();
	}
});

Template.layout.onCreated(function() {
	this.showIntro = new ReactiveVar(!Session.get("introShown"));
});

Template.layout.events({
	"click .-toggleIntro": function(event, instance) {
		if (Router.current().route.options.template != "find") return true;
		event.stopImmediatePropagation();
		instance.showIntro.set(!instance.showIntro.get());
		Session.set("introShown", true);
		return false
	},
	"click .-introContainer": function(event, instance) {
		event.stopImmediatePropagation();
	},
	"click #wrap": function(event, instance) {
		instance.showIntro.set(false);
	}
});
