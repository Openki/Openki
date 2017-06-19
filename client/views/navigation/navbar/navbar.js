Template.navbar.onRendered(function() {
	var instance = this;
	var viewportWidth = Session.get('viewportWidth');
	var gridFloatBreakpoint = SCSSVars.gridFloatBreakpoint;

	// if not collapsed give the navbar and active menu item a
	// class for when not at top
	if (viewportWidth > gridFloatBreakpoint) {
		$(window).scroll(function () {
			var navbar = instance.$('.navbar');
			var activeNavLink = instance.$('.navbar-link-active');
			var notAtTop = $(window).scrollTop() > 5;

			navbar.toggleClass('navbar-covering', notAtTop);
			activeNavLink.toggleClass('navbar-link-covering', notAtTop);
		});
	}
});

Template.navbar.helpers({
	showTestWarning: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning;
	},

	connected: function() {
		return Meteor.status().status === 'connected';
	},

	connecting: function() {
		return Meteor.status().status === 'connecting';
	},

	notConnected: function() {
		return Meteor.status().status !== 'connecting' && Meteor.status().status !== 'connected';
	},

	activeClass: function(linkRoute, id) {
		var router = Router.current();
		if (router.route && router.route.getName() === linkRoute) {
			if (typeof id == 'string' && router.params._id !== id) return '';
			return 'navbar-link-active';
		} else {
			return '';
		}
	},

	toggleNavbarRight: function(LTRPos) {
		var isRTL = Session.get('textDirectionality') == 'rtl';

		if (LTRPos === 'left') {
			return isRTL ? 'navbar-right' : '';
		} else {
			return isRTL ? '' : 'navbar-right';
		}
	}
});

Template.navbar.events({
	'click .js-nav-dropdown-close': function(event, instance) {
		instance.$('.navbar-collapse').collapse('hide');
	},

	'show.bs.dropdown, hide.bs.dropdown .dropdown': function(e, instance) {
		var viewportWidth = Session.get('viewportWidth');
		var gridFloatBreakpoint = SCSSVars.gridFloatBreakpoint;

		if (viewportWidth <= gridFloatBreakpoint) {
			var container = instance.$('#bs-navbar-collapse-1');

			// make menu item scroll up when opening the dropdown menu
			if (e.type == 'show') {
				var scrollTo = $(e.currentTarget);

				container.animate({
					scrollTop: scrollTo.offset().top
						- container.offset().top
						+ container.scrollTop()
				});
			} else {
				container.scrollTop(0);
			}
		}
	},
});
