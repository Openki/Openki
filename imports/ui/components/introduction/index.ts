import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import { Introduction } from '/imports/ui/lib/introduction';
import { ScssVars } from '/imports/ui/lib/scss-vars';
import * as Viewport from '/imports/ui/lib/viewport';

import '/imports/ui/components/price-policy';

import './introduction.html';

Template.introduction.onRendered(() => {
	// use $screen-xxs (from scss) to compare with the width of window
	const { screenXXS } = ScssVars;
	if (Viewport.get().width < screenXXS) {
		Introduction.closeIntro();
	}
});

Template.introduction.helpers({
	shownIntro() {
		return Introduction.shownIntro();
	},

	openedIntro() {
		return Introduction.openedIntro();
	},

	isInCalendar() {
		const currentRoute = Router.current().route;
		return currentRoute?.getName() === 'calendar';
	},

	/**
	 * @param {string} triggerSize
	 */
	clearfixFor(triggerSize) {
		const viewportWidth = Viewport.get().width;
		let screenSize = '';

		if (viewportWidth < ScssVars.screenMD && viewportWidth > ScssVars.screenSM) {
			screenSize = 'screenSM';
		} else if (viewportWidth < ScssVars.screenSM && viewportWidth > ScssVars.screenXXS) {
			screenSize = 'screenXS';
		}

		return triggerSize === screenSize;
	},
});

Template.introduction.events({
	'click .js-introduction-close-btn'() {
		Introduction.doneIntro();
	},

	'click .js-introduction-toggle-btn'() {
		if (Introduction.openedIntro()) {
			Introduction.closeIntro();
		} else {
			Introduction.openIntro();
		}
	},
});
