import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import Introduction from '/imports/ui/lib/introduction.js';
import ScssVars from '/imports/ui/lib/scss-vars.js';

import '/imports/ui/components/price-policy/price-policy.js';

import './introduction.html';

Template.introduction.onRendered(function() {
	// use $screen-xxs (from scss) to compare with the width of window
	const viewportWidth = Session.get('viewportWidth');
	const screenXXS = ScssVars.screenXXS;
	if (viewportWidth < screenXXS) {
		Introduction.closeIntro();
	}
});

Template.introduction.helpers({
	shownIntro() {
		console.log(Introduction.shownIntro());
		return Introduction.shownIntro();
	},

	openedIntro() {
		return Introduction.openedIntro();
	},

	isInCalendar() {
		var currentRoute = Router.current().route;
		if (!!currentRoute) return currentRoute.getName() == "calendar";
	},

	clearfixFor(triggerSize) {
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
