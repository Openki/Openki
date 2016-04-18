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
				this.$('.navbar-container').addClass('navbar-covering-content');
				this.$('.navbar-link-active').addClass('navbar-link-covering');
			}
			else {
				this.$('.navbar-container').removeClass('navbar-covering-content');
				this.$('.navbar-link-active').removeClass('navbar-link-covering');
			}
		});
	}
	else {
		this.$('.dropdown').on('show.bs.dropdown', _.debounce(function(e){
			$('#bs-navbar-collapse-1').scrollTop($(this).offset().top - 50);
		}, 1));
	}
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
