import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";

import { Filtering } from "/imports/utils/filtering";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { Type } from "/imports/utils/CustomChecks";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

/** DB-Model */
export interface JoinLinkEntity {
  /** ID */
  _id: string;
  /** tenant id */
  tenant: string;
  token: string;
  createdAt: Date;
  /** user id */
  createdBy: string;
}

export const FindFilterPattern = {
  tenant: Match.Maybe(String),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export class JoinLinksCollection extends Mongo.Collection<JoinLinkEntity> {
  constructor() {
    super("JoinLinks");

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ tenant: 1, token: 1 });
    }
  }

  Filtering() {
    return new Filtering({});
  }

  /**
   * @param limit how many to find
   * @param skip skip this many before returning results
   * @param sort list of fields to sort by
   */
  findFilter(filter: FindFilter = {}, limit = 0, skip = 0, sort: FieldSort[] = []) {
    check(filter, Match.Maybe(FindFilterPattern));
    check(limit, Match.Maybe(Match.Integer));
    check(skip, Match.Maybe(Match.Integer));
    check(sort, Match.Maybe([FieldSortPattern]));

    const find: Mongo.Selector<JoinLinkEntity> = {};
    const options: Mongo.Options<JoinLinkEntity> = {};
    const order = sort;

    if (limit > 0) {
      options.limit = limit;
    }

    if (skip > 0) {
      options.skip = skip;
    }

    if (filter.tenant) {
      find.tenant = filter.tenant;
    }

    order.push(["createdAt", "desc"]);

    options.sort = order;

    return this.find(find, options) as Mongo.Cursor<JoinLinkEntity>;
  }
}

export const JoinLinks = new JoinLinksCollection();
