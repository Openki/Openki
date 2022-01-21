import { Tracker } from 'meteor/tracker';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';

// Based on the router-autoscroll package version 0.1.8

// Do not scroll the next time you normally would
let cancelNext = false;

const RouterAutoscroll = {
	marginTop: 0,
	cancelNext() {
		cancelNext = true;
	},
};

// use _jQuery if available, otherwise support IE9+
const scrollTop = function () {
	// uses solution from http://stackoverflow.com/questions/871399/cross-browser-method-for-detecting-the-scrolltop-of-the-browser-window
	return document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
};

const scrollToPos = function (position) {
	if (position === undefined) return;

	window.scroll(0, position - RouterAutoscroll.marginTop);
};

let backToPosition;
// Saved positions will survive a hot code push
const scrollPositions = new ReactiveDict('okgrow-router-autoscroll');

function saveScrollPosition() {
	scrollPositions.set(window.location.href, scrollTop());
}

// TODO use history state so we don't litter
window.onpopstate = function () {
	backToPosition = scrollPositions.get(window.location.href);
};

// Scroll to the right place after changing routes. "The right place" is:
// 1. The previous position if we're returning via the back button
// 2. The element whose id is specified in the URL hash
// 3. The top of page otherwise
function getScrollToPosition() {
	if (backToPosition) {
		const oldPosition = backToPosition;
		backToPosition = undefined;
		return oldPosition;
	}

	const id = window.location.hash.replace('#', '');

	if (cancelNext) {
		cancelNext = false;
		return undefined;
	}

	const element = id && document.getElementById(id);
	if (element) {
		return element.getBoundingClientRect().top + scrollTop();
	}

	return 0;
}

RouterAutoscroll.scheduleScroll = function () {
	Tracker.afterFlush(() => {
		Meteor.defer(() => {
			const position = getScrollToPosition();
			scrollToPos(position);
		});
	});
};

function ironWhenReady(callFn) {
	return function () {
		const self = this;
		if (self.ready()) callFn();
	};
}

if (Package['iron:router']) {
	Package['iron:router'].Router.onAfterAction(ironWhenReady(RouterAutoscroll.scheduleScroll));
	Package['iron:router'].Router.onStop(saveScrollPosition);
}

RouterAutoscroll.scrollPositions = scrollPositions;

export default RouterAutoscroll;
