Template.navbar.onRendered(function() {
	var instance = this;
	var dropdown = instance.$('.dropdown');
	var gridFloatBreakpoint = SCSSVars.gridFloatBreakpoint;
	var notCollapsed = Session.get('viewportWidth') > gridFloatBreakpoint;

	if (notCollapsed) {
		// animate navbar dropdowns with a sliding motion
		dropdown.on('show.bs.dropdown hide.bs.dropdown', function(e) {
			var dropdownMenu = $(e.currentTarget).find('.dropdown-menu').first();

			dropdownMenu.stop(true, true).slideToggle();
		});

		// give the navbar and active menu item a class for when not at top
		$(window).scroll(function () {
			var navbar = instance.$('.navbar');
			var activeNavLink = instance.$('.navbar-link-active');
			var notAtTop = $(window).scrollTop() > 5;

			navbar.toggleClass('navbar-covering', notAtTop);
			activeNavLink.toggleClass('navbar-link-covering', notAtTop);
		});
	} else {
		var container = instance.$('#bs-navbar-collapse-1');

		// make menu item scroll up when opening the dropdown menu
		instance.$('.dropdown').on('show.bs.dropdown', _.debounce(function(e){
			var scrollTo = $(e.currentTarget);
			container.animate({
				scrollTop: scrollTo.offset().top
				           - container.offset().top
				           + container.scrollTop()
			});
		}, 1));

		instance.$('.dropdown').on('hide.bs.dropdown', function(e){
			container.scrollTop(0);
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
});
