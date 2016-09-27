Template.introduction.onRendered(function() {
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

	// use $screen-xxs (from scss) to compare with the width of window
	if (Session.get("viewportWidth") < 380) {
		Assistant.closeIntro();
		// dont wait for slideUp
		this.$('.introduction-content').hide();
	}
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
	},

	clearfixFor: function(triggerSize) {
		var viewportWidth = Session.get('viewportWidth');
		var screenSize = '';

		if (viewportWidth < 992 && viewportWidth > 768) {
			screenSize = "screenSm";
		} else if (viewportWidth < 768 && viewportWidth > 380) {
			screenSize = "screenXs";
		}

		return (triggerSize == screenSize);
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
