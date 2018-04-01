import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import Introduction from '/imports/ui/lib/introduction.js';
import ScssVars from '/imports/ui/lib/scss-vars.js';

import '/imports/ui/components/price-policy/price-policy.js';

import './introduction.html';

Template.introduction.onRendered(function() {
	if (!Introduction.openedIntro()) {
		this.$('.introduction-content').hide();
	}

	var instance = this;
	this.autorun(function() {
		if (Introduction.openedIntro()) {
			instance.$('.introduction-content').slideDown(400);
		} else {
			instance.$('.introduction-content').slideUp(400);
		}
	});

	// use $screen-xxs (from scss) to compare with the width of window
	var viewportWidth = Session.get('viewportWidth');
	var screenXXS = ScssVars.screenXXS;
	if (viewportWidth < screenXXS) {
		Introduction.closeIntro();
		// dont wait for slideUp
		this.$('.introduction-content').hide();
	}
});

Template.introduction.helpers({
	openedIntro: function() {
		return Introduction.openedIntro();
	},

	isInCalendar: function() {
		var currentRoute = Router.current().route;
		if (!!currentRoute) return currentRoute.getName() == "calendar";
	},

	clearfixFor: function(triggerSize) {
		var viewportWidth = Session.get('viewportWidth');
		var screenSize = '';

		if (viewportWidth < ScssVars.screenMD && viewportWidth > ScssVars.screenSM) {
			screenSize = "screenSM";
		} else if (viewportWidth < ScssVars.screenSM && viewportWidth > ScssVars.screenXXS) {
			screenSize = "screenXS";
		}

		return (triggerSize == screenSize);
	}
});
