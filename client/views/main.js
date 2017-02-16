Template.layout.helpers({
	testWarning: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning;
	},

    submenuShown: function() {
        var route = Router.current().route;
        submenuRoutes = [
            'home',
            'groupDetails'
        ];

        if (route) return ~submenuRoutes.indexOf(route.getName());
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
	Session.set('isRetina', (window.devicePixelRatio == 2));
};
