Template.navbar.onRendered(function() {
	var isMobile = Session.get('screenSize') <= 768; // @screen-sm
	if (!isMobile) {
		this.$('.dropdown').on('show.bs.dropdown', function(e){
			$(this).find('.dropdown-menu').first().stop(true, true).slideDown();
		});
		this.$('.dropdown').on('hide.bs.dropdown', function(e){
			$(this).find('.dropdown-menu').first().stop(true, true).slideUp();
		});

		$(window).scroll(function (event) {
			if($(window).scrollTop() > 5){
				this.$('.navbar').addClass('navbar-covering');
				this.$('.navbar-link-active').addClass('navbar-link-covering');
			}
			else {
				this.$('.navbar').removeClass('navbar-covering');
				this.$('.navbar-link').removeClass('navbar-link-covering');
			}
		});
	}
	else {
		this.$('.dropdown').on('show.bs.dropdown', _.debounce(function(e){
			var container = $('#bs-navbar-collapse-1');
			var scrollTo = $(this);
			container.animate({
				scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
			});
		}, 1));
		this.$('.dropdown').on('hide.bs.dropdown', function(e){
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
	}
});

Template.navbar.events({
	'click .js-nav-dropdown-close': function(event, instance) {
		instance.$('.navbar-collapse').collapse('hide');
	},
});
