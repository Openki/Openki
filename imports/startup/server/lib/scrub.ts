import moment from "moment";
import { Mongo } from "meteor/mongo";

import { LogCollection, LogEntity } from "/imports/api/log/factory";

export class ScrubRule {
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
    public name: string,
    public grace: number,
    public select: Mongo.Selector<LogEntity>,
    public remove = false,
    public unset: string[] | undefined = undefined,
  ) {}

  async scrub(log: LogCollection, now: moment.Moment) {
    const today = moment(now).startOf("day");
    const cutoff = today.subtract(this.grace, "days").toDate();
    const select: Mongo.Selector<LogEntity> = { ...this.select, ts: { $lt: cutoff } };

    // Register intent to scrub in the log
    const pending = await log.record("scrub", [this.name], {
      rule: this.name,
      cutoff,
    });

    if (this.remove) {
      try {
        const count = await log.removeAsync(select);

        // Record completion of scrubbing
        await pending.success({ count });
      } catch (err) {
        await pending.error(err);
      }

      // Exit early because we can't unset records that have
      // been removed.
      return;
    }

    if (this.unset) {
      const expr: Record<string, string> = {};

      // Query for existence of one of the fields that are to be
      // unset. This is not done for performance reasons but
      // so that the count in the result is correct. Records
      // where all the fields were already unset must not show
      // up in the count of newly unset records.
      const fieldSelects: Record<string, { $exists: boolean }>[] = [];
      this.unset.forEach((name) => {
        const selector = `body.${name}`;
        expr[selector] = "";
        fieldSelects.push({ [selector]: { $exists: true } });
      });
      try {
        const count = await log.updateAsync(
          { $and: [select, { $or: fieldSelects }] },
          { $unset: expr } as Mongo.Modifier<LogEntity>,
          { multi: true },
        );
        // Record completion of scrubbing
        await pending.success({ count });
      } catch (err) {
        await pending.error(err);
      }
    }
  }
}

export class Scrubber {
  static read(
    d: {
      name: string;
      grace: number;
      select: Mongo.Selector<LogEntity>;
      remove?: boolean;
      unset?: string[];
    }[],
  ) {
    return new Scrubber(d.map(ScrubRule.read));
  }

  constructor(public rules: ScrubRule[]) {}

  async scrub(log: LogCollection, now: moment.Moment) {
    for (const rule of this.rules) {
      await rule.scrub(log, now);
    }
  }
}
