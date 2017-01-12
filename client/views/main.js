Template.layout.helpers({
	testWarning: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning;
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

	Tracker.autorun(function() {
		var locale = Session.get('locale');

		if (locale) {
			// check text directionality and set/remove CSS-class accordingly
			var body = $('body');
			var isRTL = body.attr('dir') === 'rtl';

			Session.set('isRTL', isRTL);
			return isRTL ? body.addClass('rtl') : body.removeClass('rtl');
		}
	 });
};


Template.layout.events({
	'click .js-scroll': function(event, instance) {
		var position = $(event.target.getAttribute('href')).offset();
		if(typeof position != 'undefined') {
			// subtract the amount of pixels of the height of the navbar
			position = position.top - SCSSVars.navbarHeight;
			$(document.body).animate({'scrollTop': position}, 400);
		}
		event.preventDefault();
	},
});
