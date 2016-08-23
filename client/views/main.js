Template.layout.helpers({
	testWarningClass: function() {
		if (Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning) {
			return "testWarning";
		}
		return false;
	},
	translate: function() {
		var route = Router.current().route;
		return route && route.getName() === "mfTrans";
	},

	mayTranslate: function() {
		return !!Meteor.user();
	}
});

Template.layout.rendered = function() {
	$(window).resize(function(event){ getViewportWidth(); });
};
