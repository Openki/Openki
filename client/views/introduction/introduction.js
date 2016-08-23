Template.layout.onRendered(function() {
	if (!Assistant.openedIntro()) {
		this.$('.introduction-content').hide();
	}

	var instance = this;
	this.autorun(function() {
		if (Assistant.openedIntro()) {
			instance.$('.introduction-content').slideDown(400);
		} else {
			instance.$('.introduction-content').slideUp(400);
		}
	});
});


Template.layout.helpers({
	shownIntro: function() {
		return Assistant.shownIntro();
	}
});

Template.introduction.helpers({
	openedIntro: function() {
		return Assistant.openedIntro();
	},

	isInCalendar: function() {
		return Router.current().route.getName() == "calendar";
	}
});


Template.layout.events({
	// Clicks on the logo toggle the intro blurb, but only when already on home
	'click .-toggleIntro': function() {
		if (Router.current().route.options.template === "findWrap") {
			Assistant.showIntro();
		}
	},

	"click .js-introduction-close-btn": function(event, instance) {
		Assistant.doneIntro();
	},

	"click .js-introduction-toggle-btn": function(event, instance) {
		if (Assistant.openedIntro()) {
			Assistant.closeIntro();
		} else {
			Assistant.openIntro();
		}
	}
});
