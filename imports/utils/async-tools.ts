import { Meteor } from 'meteor/meteor';

import { Log } from '/imports/api/log/log';

export function checkUpdateOne(error: unknown, affectedDocuments: number) {
	if (error) {
		throw error;
	}
	if (affectedDocuments !== 1) {
		throw new Error(`Query affected ${affectedDocuments} docs, expected 1`);
	}
}

/**
 * Simple async callback receiver that logs errors
 */
export function logErrors(error: { stack: any }, result: unknown) {
	if (error) {
		/* eslint-disable-next-line no-console */
		console.log(error.stack);
		Log.record('db.cache.update.error', [], error);
	}
	return result;
}

/**
 * On the server. Repeatedly apply a cleaning function until it reports no update.
 *
 * This is supposed to settle racing cache updates with the last version
 * winning. I have not worked this out formally (nor could I), so this strategy
 * will likely fail in edge cases.
 *
 * @param clean the cleaning function
 */
// eslint-disable-next-line import/no-mutable-exports
export let untilClean: (
	clean: (resolve: (value: boolean) => void, reject: (reason?: unknown) => void) => void,
) => Promise<void>;

if (Meteor.isServer) {
	const maxTries = 3;

	const tryClean = function (
		clean: (resolve: (value: boolean) => void, reject: (reason?: unknown) => void) => void,
		tries: number,
	): Promise<void> {
		return new Promise((resolve, reject) => {
			clean(resolve, reject);
		}).then(
			(cleaned) => {
				if (!cleaned) {
					if (tries < 1) {
						// Ooops we ran out of tries.
						// This either means the updates to the cached fields happen faster than
						// we can cache them (then the cache updates would have to be throttled) or
						// that the clean function is broken (much more likely).
						throw new Error(
							`Giving up after trying to apply cleaning function ${maxTries} times: ${clean}`,
						);
					}
					return tryClean(clean, tries - 1);
				}
				return undefined;
			},
			(reason) => {
				/* eslint-disable-next-line no-console */
				console.log(`Cleaning function failed: ${reason}`);
			},
		);
	};

	untilClean = function (clean) {
		return tryClean(clean, maxTries);
	};
} else {
	// On the client clean() is not run and the returned promise doesn't resolve.
	untilClean = function () {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		return new Promise(() => {}); /* promise that doesn't resolve */
	};
}
