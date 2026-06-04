import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";

import { Filtering } from "/imports/utils/filtering";
import * as Predicates from "/imports/utils/predicates";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { Type, StringEnum } from "/imports/utils/CustomChecks";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

export const StatusPattern = StringEnum("created", "send", "accepted", "failed");

export type Status = Type<typeof StatusPattern>;

/** DB-Model */
export interface InvitationEntity {
  /** ID */
  _id: string;
  /** tenant id */
  tenant: string;
  to: string;
  token: string;
  status: Status;
  /** The user who has accepted the invitation. (by state 'accepted') */
  acceptedBy?: string;
  createdAt: Date;
  /** user id */
  createdBy: string;
}

export const FindFilterPattern = {
  tenant: Match.Maybe(String),
  status: Match.Maybe([StatusPattern]),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export class InvitationsCollection extends Mongo.Collection<InvitationEntity> {
  constructor() {
    super("Invitations");

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ tenant: 1 });
      this.createIndex({ token: 1, to: 1 });
    }
  }

  Filtering() {
    return new Filtering({
      status: Predicates.ids,
    });
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

    const find: Mongo.Selector<InvitationEntity> = {};
    const options: Mongo.Options<InvitationEntity> = {};
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

    if (filter.status && filter.status.length > 0) {
      find.status = { $in: filter.status };
    }

    order.push(["createdAt", "desc"]);

    options.sort = order;

    return this.find(find, options) as Mongo.Cursor<InvitationEntity>;
  }
}

export const Invitations = new InvitationsCollection();
