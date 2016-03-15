Template.navbar.onRendered(function() {
	var isMobile = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) <= 768;
	if (!isMobile) {
		this.$('.dropdown').on('show.bs.dropdown', function(e){
			$(this).find('.dropdown-menu').first().stop(true, true).slideDown();
		});
		this.$('.dropdown').on('hide.bs.dropdown', function(e){
			$(this).find('.dropdown-menu').first().stop(true, true).slideUp();
		});

		$(window).scroll(function (event) {
			if($(window).scrollTop() > 5){
				this.$('.navbar-container').addClass('over_content');
				this.$('a.nav_link.active').addClass('over_content');
			}
			else {
				this.$('.navbar-container').removeClass('over_content');
				this.$('a.nav_link.active').removeClass('over_content');
			}
		});
	};
});

Template.navbar.helpers({
	showTestWarning: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning;
	}
});

Template.navbar.events({
	'click .-clickClose': function(event, instance) {
		instance.$('.navbar-collapse').collapse('hide');
	},
});
