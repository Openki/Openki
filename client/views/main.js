Template.layout.helpers({
	testWarningClass: function() {
		if (Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning) {
			return "testWarning";
		}
		return false;
	},
	translate: function() {
		return Router.current().route.getName() === "mfTrans";
	}
});

Template.layout.rendered = function() {
	$(window).resize(function(event){ getWindowSize(); });
};
