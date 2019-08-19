const AsyncTools = {};

AsyncTools.checkUpdateOne = function (err, aff) {
	if (err) {
		throw err;
	}
	if (aff !== 1) {
		throw new Error(`Query affected ${aff} docs, expected 1`);
	}
};

// Simple async callback receiver that logs errors
AsyncTools.logErrors = function (err, ret) {
	if (err) {
		/* eslint-disable-next-line no-console */
		console.log(err.stack);
	}
	return ret;
};

/** Repeatedly apply a cleaning function until it reports no update.
  *
  * @param {function} clean - the cleaning function
  *
  * This is supposed to settle racing cache updates with the last version
  * winning. I have not worked this out formally (nor could I), so this strategy
  * will likely fail in edge cases.
  *
  * On the client clean() is not run and the returned promise doesn't resolve.
  */
if (Meteor.isServer) {
	const maxTries = 3;
	const tryClean = function (clean, tries) {
		return new Promise((resolve, reject) => {
			clean(resolve, reject);
		/* eslint-disable-next-line consistent-return */
		}).then((cleaned) => {
			if (!cleaned) {
				if (tries < 1) {
					// Ooops we ran out of tries.
					// This either means the updates to the cached fields happen faster than
					// we can cache them (then the cache updates would have to be throttled) or
					// that the clean function is broken (much more likely).
					throw new Error(`Giving up after trying to apply cleansing function ${maxTries} times: ${clean}`);
				}
				return tryClean(clean, tries - 1);
			}
		}, (reason) => {
			/* eslint-disable-next-line no-console */
			console.log(`Cleansing function failed: ${reason}`);
		});
	};

	AsyncTools.untilClean = function (clean) {
		return tryClean(clean, maxTries);
	};
}

if (Meteor.isClient) {
	AsyncTools.untilClean = function () {
		return new Promise(() => {}); /* promise that doesn't resolve */
	};
}

export default AsyncTools;
