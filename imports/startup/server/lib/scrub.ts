import moment from "moment";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";

import { LogCollection, LogEntity } from "/imports/api/log/factory";

export class ScrubRule {
  name: string;

  grace: number;

  select: Mongo.Selector<LogEntity>;

  remove: boolean;

  unset: string[] | undefined;

  static read(d: {
    name: string;
    grace: number;
    select: Mongo.Selector<LogEntity>;
    remove?: boolean;
    unset?: string[];
  }) {
    return new ScrubRule(d.name, d.grace, d.select, d.remove, d.unset);
  }

  constructor(
    name: string,
    grace: number,
    select: Mongo.Selector<LogEntity>,
    remove = false,
    unset: string[] | undefined = undefined,
  ) {
    check(name, String);
    this.name = name;

    check(grace, Number);
    this.grace = grace;

    check(select, Object);
    this.select = select;

    check(remove, Boolean);
    this.remove = remove;

    check(unset, Match.Optional([String]));
    this.unset = unset;
  }

  async scrub(log: LogCollection, now: moment.Moment) {
    const today = moment(now).startOf("day");
    const cutoff = today.subtract(this.grace, "days").toDate();
    const select: Mongo.Selector<LogEntity> = { ...this.select, ts: { $lt: cutoff } };

    // Register intent to scrub in the log
    const pending = await log.record("scrub", [this.name], {
      rule: this.name,
      cutoff,
    });

    // Record completion of scrubbing
    const recordResult = (err: unknown, count: number) => {
      if (err) {
        pending.error(err);
      } else {
        pending.success({ count } as any);
      }
    };

    if (this.remove) {
      await log.removeAsync(select, recordResult);

      // Exit early because we can't unset records that have
      // been removed.
      return;
    }

    if (this.unset) {
      const expr: { [selector: string]: string } = {};

      // Query for existence of one of the fields that are to be
      // unset. This is not done for performance reasons but
      // so that the count in the result is correct. Records
      // where all the fields were already unset must not show
      // up in the count of newly unset records.
      const fieldSelects: { [selector: string]: { $exists: boolean } }[] = [];
      this.unset.forEach((name) => {
        const selector = `body.${name}`;
        expr[selector] = "";
        fieldSelects.push({ [selector]: { $exists: true } });
      });
      log.update(
        { $and: [select, { $or: fieldSelects }] },
        { $unset: expr } as Mongo.Modifier<LogEntity>,
        { multi: true },
        recordResult,
      );
    }
  }
}

export class Scrubber {
  rules: ScrubRule[];

  static read(
    d: {
      name: string;
      grace: number;
      select: Mongo.Selector<LogEntity>;
      remove?: boolean;
      unset?: string[];
    }[],
  ) {
    check(d, [Object]);
    return new Scrubber(d.map(ScrubRule.read));
  }

  constructor(rules: ScrubRule[]) {
    check(rules, [ScrubRule]);
    this.rules = rules;
  }

  async scrub(log: LogCollection, now: moment.Moment) {
    for (const rule of this.rules) {
      // eslint-disable-next-line no-await-in-loop
      await rule.scrub(log, now);
    }
  }
}
