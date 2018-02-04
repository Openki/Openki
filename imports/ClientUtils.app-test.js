import { DDP } from 'meteor/ddp-client';
import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import { chai } from 'chai';
/**
 * Returns a promise which resolves when all subscriptions are ready.
 */
export const subscriptionsReady = () => new Promise(resolve => {
	const poll = Meteor.setInterval(() => {
		if (DDP._allSubscriptionsReady()) {
			Meteor.clearInterval(poll);
			resolve();
		}
	}, 200);
});

/**
 * Returns a promise which resolves if test returns anything but undefined.
 *
 * The test function is run in response to dom mutation events. See:
 * https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 */
export const elementsReady = (test) => new Promise(resolve  => {
	let result = test([]);
	if (result !== undefined) {
		resolve(result);
	}
	else {
		const observer = new MutationObserver(function(mutations) {
			let result = test(mutations);
			if (result !== undefined) {
				observer.disconnect();
				resolve(result);
			}
		});

		observer.observe(document.body, {
			childList: true, subtree: true, attributes: false, characterData: false
		});
	}
});


/** Try an assertion on every DOM mutation
  *
  * Params:
  *   assertion: function that throws an AssertionError until its demands are met
  *   timeout: after this many milliseconds, the AssertionError is passed on
  *
  * Returns a promise that resolves with the last return value of assertion()
  * once the assertion holds. The promise is
  * rejected when the assertion throws something which is not an AssertionError
  * or when the timeout runs out without the assertion coming through.
  */
export const waitFor = (assertion, timeout=1000) => () => new Promise((resolve, reject) => {
	const start = new Date().getTime();
	let timer = false;
	let observer = false;

	const clearWatchers = () => {
		if (timer) Meteor.clearTimeout(timer);
		if (observer) observer.disconnect();
	};

	const tryIt = () => {
		try {
			const result = assertion();
			clearWatchers();
			resolve(result);
			return true;
		} catch (e) {
			if (e instanceof chai.AssertionError) {
				if (new Date().getTime() - start < timeout) {
					return false;
				}
			}
			clearWatchers();
			reject(e);
		}
		return false;
	};

	if (tryIt()) return;

	timer = Meteor.setTimeout(tryIt, timeout);
	observer = new MutationObserver(tryIt);

	observer.observe(document.body, {
		childList: true, subtree: true, attributes: true, characterData: true
	});
});
