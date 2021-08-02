import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';
import { Filtering } from '/imports/utils/filtering';
import * as Predicates from '/imports/utils/predicates';

// ======== DB-Model: ========
/**
 * @typedef {object} Resolution
 * @property {Date} ts timestamp
 * @property {boolean} success
 * @property {string} [message]
 */
/**
 * @typedef {object} LogEntity
 * @property {string} _id ID
 * @property {string} tr This separates log entries into classes.
 *       Entries on the same track are expected to have a similarily
 *       structured body, but this structure may change over time.
 * @property {Date} ts (timestamp)
 *       The time the log entry was recorded.
 * @property {string[]} rel (list of relation ID)
 *       List of lookup ID strings. These are used to select log-entries in
 *       queries.
 * @property {any} body Contents of the log entry. These are not indexed and depend on the
 *       track.
 * @property {Resolution[]} res
 */

class ResultLogger {
	/**
	 * @param {string} id
	 * @param {LogCollection} log
	 * @param {boolean} printToLog
	 */
	constructor(id, log, printToLog) {
		this.id = id;
		this.log = log;
		this.printToLog = printToLog;
	}

	/**
	 * @param {string} [message]
	 */
	success(message) {
		this.record(true, message);
	}

	/**
	 * @param {any} error
	 */
	error(error) {
		const message = JSON.parse(JSON.stringify(error));
		this.record(false, message);
	}

	/**
	 * @param {boolean} success
	 * @param {string} [message]
	 */
	record(success, message) {
		/** @type {Resolution} */
		const resolution = { ts: new Date(), success };
		if (message) resolution.message = message;

		if (this.printToLog) {
			/* eslint-disable-next-line no-console */
			console.log({ id: this.id, resolution });
		}
		this.log.update(this.id, { $push: { res: resolution } });
	}
}

/**
 * @extends {Mongo.Collection<LogEntity>}
 *
 * The Application Log records user and system decisions. It is intended to
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
 */
export class LogCollection extends Mongo.Collection {
	/**
	 * @param {string|null} name
	 * @param {boolean} isServer
	 * @param {boolean} printToLog
	 */
	constructor(name, isServer, printToLog) {
		super(name);

		if (isServer) {
			this._ensureIndex({ tr: 1 });
			this._ensureIndex({ ts: 1 });
			this._ensureIndex({ rel: 1 });
		}

		this.printToLog = printToLog;
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({
			start: Predicates.date,
			rel: Predicates.ids,
			tr: Predicates.ids,
		});
	}

	/**
	 * Record a new entry to the log
	 * @param  {string} track type of log entry
	 * @param  {string[]} rel related ID
	 * @param  {Object} body log body depending on track
	 */
	record(track, rel, body) {
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

		const id = this.insert(entry);

		if (this.printToLog) {
			/* eslint-disable-next-line no-console */
			console.log(entry);
		}

		return new ResultLogger(id, this, this.printToLog);
	}

	/**
	 * @param {{ start?: Date; rel?: string[]; tr?: string[]; }} filter
	 * @param {number} limit
	 */
	findFilter(filter, limit) {
		check(filter, {
			start: Match.Optional(Date),
			rel: Match.Optional([String]),
			tr: Match.Optional([String]),
		});
		check(limit, Number);

		const query = {};
		if (filter.start) query.ts = { $lte: filter.start };
		if (filter.rel) query.$or = [{ _id: { $in: filter.rel } }, { rel: { $in: filter.rel } }];
		if (filter.tr) query.tr = { $in: filter.tr };

		return this.find(query, { sort: { ts: -1 }, limit });
	}
}

/**
 * The logFactory Knows how to create log collections.
 *
 * It can create two types.
 */
export const logFactory = {
	/**
	 * A log backed by the mongo DB
	 */
	mongo: (/** @type {boolean} */ isServer, /** @type {boolean} */ printToLog) =>
		new LogCollection('Log', isServer, printToLog),

	/**
	 * An in-memory log useful for tests
	 */
	fake: () =>
		// Local collection for in-memory storage
		new LogCollection(null, false, false),
};

export default logFactory;
