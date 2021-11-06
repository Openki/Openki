import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';
import { Filtering } from '/imports/utils/filtering';
import * as Predicates from '/imports/utils/predicates';
import { PrivateSettings } from '/imports/utils/PrivateSettings';

// ======== DB-Model: ========
export interface Resolution {
	/** timestamp */
	ts: Date;
	success: boolean;
	message?: string;
}
export interface LogEntity {
	/** ID */
	_id: string;
	/**
	 * This separates log entries into classes.
	 * Entries on the same track are expected to have a similarily structured body, but this
	 * structure may change over time.
	 */
	tr: string;
	/**
	 * (timestamp)
	 * The time the log entry was recorded.
	 */
	ts: Date;
	/**
	 * (list of relation ID)
	 * List of lookup ID strings. These are used to select log-entries in queries.
	 */
	rel: string[];
	/** Contents of the log entry. These are not indexed and depend on the track. */
	body: any;
	res: Resolution[];
}

class ResultLogger {
	// eslint-disable-next-line no-useless-constructor
	constructor(public id: string, public log: LogCollection) {}

	success(message?: string) {
		this.record(true, message);
	}

	error(error: any) {
		const message = JSON.parse(JSON.stringify(error));
		this.record(false, message);
	}

	record(success: boolean, message?: string) {
		const resolution: Resolution = { ts: new Date(), success };
		if (message) resolution.message = message;

		if (Meteor.isServer && PrivateSettings.printLog) {
			/* eslint-disable-next-line no-console */
			console.log({ id: this.id, resolution });
		}

		this.log.update(this.id, { $push: { res: resolution } });
	}
}

/**
 * The Application Log records user and system decisions. It is intended to become the single source
 * of truth within the application.
 *
 * The log is helpful in reconstructing the state of the app when things went wrong. when wrong
 * values were recorded, these log entries are not changed, but new ones with the corrected values
 * written. It is important that log entries are not changed once written. Only in these instances
 * should we consider it:
 *  - An update needs to rename the track names or add relation ID
 *  - An update needs to update the body of a track
 *  - When we really want to.
 * So Changes should only happen while the service is down and we boot into a new world.
 */
export class LogCollection extends Mongo.Collection<LogEntity> {
	constructor(name: string | null) {
		super(name);

		if (name && Meteor.isServer) {
			this.createIndex({ tr: 1 });
			this.createIndex({ ts: 1 });
			this.createIndex({ rel: 1 });
		}
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
	 * @param track type of log entry
	 * @param rel related ID
	 * @param body log body depending on track
	 */
	record(track: string, rel: string[], body: any) {
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

		if (Meteor.isServer && PrivateSettings.printLog) {
			/* eslint-disable-next-line no-console */
			console.log(entry);
		}

		return new ResultLogger(id, this);
	}

	findFilter(filter: { start?: Date; rel?: string[]; tr?: string[] }, limit: number) {
		check(filter, {
			start: Match.Optional(Date),
			rel: Match.Optional([String]),
			tr: Match.Optional([String]),
		});
		check(limit, Number);

		const query: Mongo.Selector<LogEntity> = {};
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
	persistent: () => new LogCollection('Log'),

	/**
	 * An in-memory log useful for tests
	 */
	temporary: () =>
		// Local collection for in-memory storage
		new LogCollection(null),
};

export default logFactory;
