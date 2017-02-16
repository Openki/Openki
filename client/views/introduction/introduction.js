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
	var viewportWidth = Session.get('viewportWidth');
	var screenXXS = SCSSVars.screenXXS;
	if (viewportWidth < screenXXS) {
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
		var currentRoute = Router.current().route;
		if (!!currentRoute) return currentRoute.getName() == "calendar";
	},

	clearfixFor: function(triggerSize) {
		var viewportWidth = Session.get('viewportWidth');
		var screenSize = '';

		if (viewportWidth < SCSSVars.screenMD && viewportWidth > SCSSVars.screenSM) {
			screenSize = "screenSM";
		} else if (viewportWidth < SCSSVars.screenSM && viewportWidth > SCSSVars.screenXXS) {
			screenSize = "screenXS";
		}

		return (triggerSize == screenSize);
	}
});


Template.layout.events({
	// Clicks on the logo toggle the intro blurb, but only when already on home
	'click .js-toggle-introduction': function() {
		var route = Router.current().route;
		if (route && route.options.template === "findWrap") {
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
