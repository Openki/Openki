// Simple async callback receiver that logs eventual errors
logAsyncErrors = function(err, ret) {
	if (err) {
		console.log(err.stack);
	}
	return ret;
};

// Repeatedly apply a function until it reports no update
// The wrapped function will be called repeatedly until it returns true
// This helps ensuring racing cache updates are settled with
// the last version winning
untilClean = function(clean) {
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