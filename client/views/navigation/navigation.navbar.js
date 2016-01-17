Template.navbar.onRendered(function() {
	this.$('.dropdown').on('show.bs.dropdown', function(e){
		$(this).find('.dropdown-menu').first().stop(true, true).show();
	});

	this.$('.dropdown').on('hide.bs.dropdown', function(e){
		$(this).find('.dropdown-menu').first().stop(true, true).hide();
	});

	$(window).scroll(function (event) {
		if($(window).scrollTop() > 1){
			this.$('.navbar-container').addClass('over_content');
			this.$('a.nav_link.active').addClass('over_content');
		}
		else if($(window).scrollTop() < 1){
			this.$('.navbar-container').removeClass('over_content');
			this.$('a.nav_link.active').removeClass('over_content');
		}
	});
});

Template.navbar.helpers({
	showTestWarning: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning;
	}
});

Template.navbar.events({
	'click .-clickClose': function(event, instance) {
		instance.$('.navbar-collapse').collapse('hide');
	}
});
