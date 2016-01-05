Template.navbar.onRendered(function() {
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
		else if($(window).scrollTop() < 5){
			this.$('.navbar-container').removeClass('over_content');
			this.$('a.nav_link.active').removeClass('over_content');
		}
	});
});

Template.navbar.helpers({
	siteName: function() {
		if (Meteor.settings.public && Meteor.settings.public.siteName) {
			return Meteor.settings.public.siteName;
		}
		return "Hmmm";
	}
});

Template.navbar.events({
	'click .-clickClose': function(event, instance) {
		instance.$('.navbar-collapse').collapse('hide');
	}
});
