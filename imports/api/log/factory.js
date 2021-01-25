// Becase the mixin() function assigns properties
// to the log object, we can't use the
// no-param-reassign safeguard here.
/* eslint no-param-reassign: 0 */

import Filtering from '/imports/utils/filtering';
import Predicates from '/imports/utils/predicates';

/** The Application Log records user and system decisions. It is intended to
  * become the single source of truth within the application.
  *
  * The log is helpful in reconstructing the state of the app when things
  * went wrong. when wrong values were recorded, these log entries are not
  * changed, but new ones with the corrected values written.
  * It is important that log entries are not changed once written. Only in these
  * instances should we consider it:
  *  - An update needs to rename the track names or add relation ID
  *  - An update needs to update the body of a track
  *  - When we really want to.
  * So Changes should only happen while the service is down and we boot into a
  * new world.
  *
  * There are four fields to every log-entry:
  *    tr (track String)
  *       This separates log entries into classes.
  *       Entries on the same track are expected to have a similarily
  *       structured body, but this structure may change over time.
  *
  *   rel (list of relation ID)
  *       List of lookup ID strings. These are used to select log-entries in
  *       queries.
  *
  *    ts (timestamp Date)
  *       The time the log entry was recorded.
  *
  *  body (Object)
  *       Contents of the log entry. These are not indexed and depend on the
  *       track.
  */
const mixin = function (log, isServer, printToLog) {
	if (isServer) {
		log._ensureIndex({ tr: 1 });
		log._ensureIndex({ ts: 1 });
		log._ensureIndex({ rel: 1 });
	}

	log.Filtering = () => Filtering(
		{
			start: Predicates.date,
			rel: Predicates.ids,
			tr: Predicates.ids,
		},
	);

	class ResultLogger {
		constructor(id) {
			this.id = id;
		}

		success(message) {
			this.record(true, message);
		}

		error(error) {
			const message = JSON.parse(JSON.stringify(error));
			this.record(false, message);
		}

		record(success, message) {
			const resolution = { ts: new Date(), success };
			if (message) resolution.message = message;

			if (printToLog) {
				/* eslint-disable-next-line no-console */
				console.log({ id: this.id, resolution });
			}
			log.update(this.id, { $push: { res: resolution } });
		}
	}

	/**
	 * Record a new entry to the log
	 * @param  {String} track   - type of log entry
	 * @param  {String} rel     - related ID
	 * @param  {Object} body    - log body depending on track
	 */
	log.record = function (track, rel, body) {
		check(track, String);
		check(rel, [String]);
		check(body, Object);
		const entry = {
			tr: track,
			ts: new Date(),
			rel,
			body,
			res: [],
		};

		const id = log.insert(entry);

		if (printToLog) {
			/* eslint-disable-next-line no-console */
			console.log(entry);
		}

		return new ResultLogger(id);
	};

	/**
	 * @param {{ start?: Date; rel?: string[]; tr?: string[]; }} filter
	 * @param {number} limit
	 */
	log.findFilter = function (filter, limit) {
		check(filter,
			{
				start: Match.Optional(Date),
				rel: Match.Optional([String]),
				tr: Match.Optional([String]),
			});
		check(limit, Number);

		const query = {};
		if (filter.start) query.ts = { $lte: filter.start };
		if (filter.rel) query.$or = [{ _id: { $in: filter.rel } }, { rel: { $in: filter.rel } }];
		if (filter.tr) query.tr = { $in: filter.tr };

		return log.find(query, { sort: { ts: -1 }, limit });
	};
};

/**
 * The logFactory Knows how to create log collections.
 *
 * It can create two types:
 *
 * logFactory.mongo: A log backed by the mongo DB
 *
 * logFactory.fake: An in-memory log useful for tests
 */
const logFactory = {
	mongo: (mongo, isServer, printToLog) => {
		const log = new mongo.Collection('Log');
		mixin(log, isServer, printToLog);
		return log;
	},

	fake: () => {
		const log = new Meteor.Collection(null);
		mixin(log, false, false);
		return log;
	},
};

export { logFactory as default, logFactory };
