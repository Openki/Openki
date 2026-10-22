import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";
import { serializeError } from "serialize-error";

import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { Type } from "/imports/utils/CustomChecks";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

// ======== DB-Model: ========
export interface Resolution {
  /** timestamp */
  ts: Date;
  success: boolean;
  message?: string | object;
}
export interface LogEntity {
  /** ID */
  _id: string;
  /**
   * This separates log entries into classes.
   * Entries on the same track are expected to have a similarly structured body, but this
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
  body: unknown;
  res: Resolution[];
}

class ResultLogger {
  constructor(
    public id: string,
    public log: LogCollection,
  ) {}

  async success(message?: Parameters<typeof ResultLogger.prototype.record>[1]) {
    await this.record(true, message);
  }

  async error(error: unknown) {
    const message = serializeError(error);
    await this.record(false, message);
  }

  async record(success: boolean, message?: string | object) {
    const resolution: Resolution = { ts: new Date(), success };
    if (message) resolution.message = message;

    if (Meteor.isServer && PrivateSettings.printLog) {
      console.log({ id: this.id, resolution });
    }

    await this.log.updateAsync(this.id, { $push: { res: resolution } });
  }
}

export const FindFilterPattern = {
  start: Match.Maybe(Date),
  rel: Match.Maybe([String]),
  tr: Match.Maybe([String]),
};
export type FindFilter = Type<typeof FindFilterPattern>;

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

    if (name && Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ tr: 1, ts: 1 });
      this.createIndex({ ts: 1 });
      this.createIndex({ rel: 1 });
    }
  }

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
  async record(track: string, rel: string[], body: object) {
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

    if (Meteor.isServer && PrivateSettings.printLog) {
      console.log(entry);
    }

    const id = await this.insertAsync(entry);

    return new ResultLogger(id, this);
  }

  findFilter(filter: FindFilter, limit: number) {
    check(filter, FindFilterPattern);
    check(limit, Match.Integer);

    const query: Parameters<typeof this.find>[0] = {};
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
  persistent: () => new LogCollection("Log"),

  /**
   * An in-memory log useful for tests
   */
  temporary: () =>
    // Local collection for in-memory storage
    new LogCollection(null),
};
