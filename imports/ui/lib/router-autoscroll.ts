import { Tracker } from 'meteor/tracker';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

// use _jQuery if available, otherwise support IE9+
function getScrollTop() {
	// uses solution from http://stackoverflow.com/questions/871399/cross-browser-method-for-detecting-the-scrolltop-of-the-browser-window
	return document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
}

function whenReady(callFn: () => void) {
	return function (this: { ready: () => boolean }) {
		if (this.ready()) callFn();
	};
}

// Based on the router-autoscroll package version 0.1.8

class RouterAutoscroll {
	private backToPosition: number | undefined;

	// Saved positions will survive a hot code push
	private scrollPositions = new ReactiveDict<Record<string, number>>('okgrow-router-autoscroll');

	/** Do not scroll the next time you normally would */
	private _cancelNext = false;

	public marginTop = 0;

	constructor() {
		// TODO use history state so we don't litter
		window.onpopstate = () => {
			this.backToPosition = this.scrollPositions.get(window.location.href);
		};

		Router.onAfterAction(whenReady(() => this.scheduleScroll()));
		Router.onStop(() => this.saveScrollPosition());
	}

	private saveScrollPosition() {
		this.scrollPositions.set(window.location.href, getScrollTop());
	}

	// Scroll to the right place after changing routes. "The right place" is:
	// 1. The previous position if we're returning via the back button
	// 2. The element whose id is specified in the URL hash
	// 3. The top of page otherwise
	private getScrollToPosition() {
		if (this.backToPosition) {
			const oldPosition = this.backToPosition;
			this.backToPosition = undefined;
			return oldPosition;
		}

		const id = window.location.hash.replace('#', '');

		if (this._cancelNext) {
			this._cancelNext = false;
			return undefined;
		}

		const element = id && document.getElementById(id);
		if (element) {
			return element.getBoundingClientRect().top + getScrollTop() - this.marginTop;
		}

		return 0;
	}

	private static scrollToPos(position: number | undefined) {
		if (position === undefined) return;

		window.scroll(0, position);
	}

	public scheduleScroll() {
		Tracker.afterFlush(() => {
			Meteor.defer(() => {
				const position = this.getScrollToPosition();
				RouterAutoscroll.scrollToPos(position);
			});
		});
	}

	public cancelNext() {
		this._cancelNext = true;
	}
}

export default new RouterAutoscroll();
