export default AsyncTools = {};

AsyncTools.checkUpdateOne = function(err, aff) {
	if (err) throw err;
	if (aff != 1) throw "Query affected "+aff+" docs, expected 1";
};

// Simple async callback receiver that logs errors
AsyncTools.logErrors = function(err, ret) {
	if (err) {
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
  * On the client clean() is not run.
  */
if (Meteor.isServer) {
	AsyncTools.untilClean = function(clean) {
		var tries = 0;
		for (; tries < 3; tries++) {
			if (clean()) return;
		}

		// Ooops we ran out of tries.
		// This either means the updates to the cached fields happen faster than
		// we can cache them (then the cache updates would have to be throttled) or
		// that the clean function is broken (much more likely).
		throw new Error("Giving up after trying to apply cleansing function "+tries+" times.");
	};
}

if (Meteor.isClient) {
	AsyncTools.untilClean = function(clean) { /* ignore */ };
}
