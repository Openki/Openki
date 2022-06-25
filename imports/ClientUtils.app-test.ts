import { DDP } from 'meteor/ddp-client';
import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import { AssertionError } from 'chai';

/**
 * Returns a promise which resolves when all subscriptions are done.
 */
export function waitForSubscriptions(): Promise<void> {
	return new Promise((resolve) => {
		const poll = Meteor.setInterval(() => {
			if (DDP._allSubscriptionsReady()) {
				Meteor.clearInterval(poll);
				resolve();
			}
		}, 200);
	});
}

/**
 * Returns a promise which resolves if test returns anything but undefined.
 *
 * The test function is run in response to dom mutation events. See:
 * https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 */
export function elementsReady(test: (mutations: MutationRecord[]) => any) {
	return new Promise((resolve) => {
		const result = test([]);
		if (result !== undefined) {
			resolve(result);
		} else {
			const observer = new MutationObserver((mutations) => {
				const mutationsResult = test(mutations);
				if (mutationsResult !== undefined) {
					observer.disconnect();
					resolve(mutationsResult);
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: false,
				characterData: false,
			});
		}
	});
}

/**
 * Try an assertion on every DOM mutation
 * @param assertion function that throws an AssertionError until its demands are met
 * @param timeout after this many milliseconds, the AssertionError is passed on
 * @returns Returns a promise that resolves with the last return value of
 * assertion() once the assertion holds. The promise is
 * rejected when the assertion throws something which is not an AssertionError
 * or when the timeout runs out without the assertion coming through.

 */
export function waitFor<T>(assertion: () => T, timeout = 10000): Promise<T> {
	return new Promise((resolve, reject) => {
		const start = new Date().getTime();
		let timer: number | false = false;
		let observer: MutationObserver | false = false;

		const clearWatchers = () => {
			if (timer) {
				Meteor.clearTimeout(timer);
			}
			if (observer) {
				observer.disconnect();
			}
		};

		const tryIt = () => {
			try {
				const result = assertion();
				clearWatchers();
				resolve(result);
				return true;
			} catch (e) {
				if (e instanceof AssertionError) {
					if (new Date().getTime() - start < timeout) {
						return false;
					}
				}
				clearWatchers();
				reject(e);
			}
			return false;
		};

		if (tryIt()) {
			return;
		}

		timer = Meteor.setTimeout(tryIt, timeout);
		observer = new MutationObserver(tryIt);

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true,
		});
	});
}
