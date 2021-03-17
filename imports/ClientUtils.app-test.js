import { DDP } from 'meteor/ddp-client';
import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import AssertionError from 'assertion-error';

/**
 * Returns a promise which resolves when all subscriptions are ready.
 * @returns {Promise<void>}
 */
export function subscriptionsReady() {
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
 * @param {(mutations: MutationRecord[]) => any} test
 */
export function elementsReady(test) {
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
				childList: true, subtree: true, attributes: false, characterData: false,
			});
		}
	});
}


/**
 * Try an assertion on every DOM mutation
 * @template T
 * @param {()=>T} assertion function that throws an AssertionError until its demands are met
 * @param {number} timeout after this many milliseconds, the AssertionError is passed on
 * @returns {()=>Promise<T>} Returns a promise that resolves with the last return value of 
 * assertion() once the assertion holds. The promise is
 * rejected when the assertion throws something which is not an AssertionError
 * or when the timeout runs out without the assertion coming through.

 */
export function waitFor(assertion, timeout = 1000) {
	return () => new Promise((resolve, reject) => {
		const start = new Date().getTime();
		/** @type {number|false} */
		let timer = false;
		/** @type {MutationObserver|false} */
		let observer = false;

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
			childList: true, subtree: true, attributes: true, characterData: true,
		});
	});
}
