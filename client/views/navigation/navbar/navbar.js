Template.navbar.onRendered(function() {
    	var instance = this;
	var gridFloatBreakpoint = Breakpoints.gridFloat;
	var isCollapsed = Session.get('viewportWidth') <= gridFloatBreakpoint;

	if (!isCollapsed) {
		instance.$('.dropdown').on('show.bs.dropdown', function(e){
			$(this).find('.dropdown-menu').first().stop(true, true).slideDown();
		});
		instance.$('.dropdown').on('hide.bs.dropdown', function(e){
			$(this).find('.dropdown-menu').first().stop(true, true).slideUp();
		});

		$(window).scroll(function () {
			var navbar = instance.$('.navbar');
			var activeNavLink = instance.$('.navbar-link-active');
			var isCovering = navbar.hasClass('navbar-covering');
			var atTop = $(window).scrollTop() < 5;

			if (!isCovering && !atTop) {
				navbar.addClass('navbar-covering');
				activeNavLink.addClass('navbar-link-covering');
			} else if (isCovering && atTop) {
				navbar.removeClass('navbar-covering');
				activeNavLink.removeClass('navbar-link-covering');
			}
		});
	} else {
		instance.$('.dropdown').on('show.bs.dropdown', _.debounce(function(e){
			var container = $('#bs-navbar-collapse-1');
			var scrollTo = $(this);
			container.animate({
				scrollTop: scrollTo.offset().top
				           - container.offset().top
				           + container.scrollTop()
			});
		}, 1));
		instance.$('.dropdown').on('hide.bs.dropdown', function(e){
			var container = $('#bs-navbar-collapse-1');
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
	}
});

Template.navbar.events({
	'click .js-nav-dropdown-close': function(event, instance) {
		instance.$('.navbar-collapse').collapse('hide');
	},
});
