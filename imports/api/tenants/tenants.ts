import { Mongo } from "meteor/mongo";
import { assignIn } from "lodash-es";
import { Match, check } from "meteor/check";

import { UserModel } from "/imports/api/users/users";

import { Filtering } from "/imports/utils/filtering";
import { FieldSort, FieldSortPattern } from "/imports/utils/sort-spec";
import { Type } from "/imports/utils/CustomChecks";

/** DB-Model */
export interface TenantEntity {
  /** ID */
  _id: string;
  name: string;
  /** List of userIds */
  members: string[];
  /** List of tenant admins */
  admins: string[];
}

export type TenantModel = Tenant & TenantEntity;

export class Tenant {
  /**
   * Check whether a user can edit the tenant.
   */
  editableBy(this: TenantModel, user: UserModel | undefined | null) {
    if (!user) {
      return false;
    }

    return (
      user.hasPrivilige("admin") /* Admins can edit all regions */ ||
      user.isTenantAdmin(this._id) /* or admins of a tenant */
    );
  }
}

export const FindFilterPattern = {
  /** Limit to tenants where logged-in user is a admin */
  adminOf: Match.Maybe(Boolean),
};
export type FindFilter = Type<typeof FindFilterPattern>;

export class TenantsCollection extends Mongo.Collection<TenantEntity, TenantModel> {
  constructor() {
    super("Tenants", {
      transform(tenant) {
        return assignIn(new Tenant(), tenant);
      },
    });
  }

  get publicFields() {
    return {
      _id: 1,
      name: 1,
      members: 1,
    };
  }

  Filtering() {
    return new Filtering({});
  }

  /**
   * Find organizations for given filters
   * @param filter dictionary with filter options
   * @param limit how many to find
   * @param skip skip this many before returning results
   * @param sort list of fields to sort by
   */
  findFilter(
    me?: UserModel | null,
    filter: FindFilter = {},
    limit = 0,
    skip = 0,
    sort?: FieldSort[],
  ) {
    check(filter, Match.Maybe(FindFilterPattern));
    check(limit, Match.Maybe(Match.Integer));
    check(skip, Match.Maybe(Match.Integer));
    check(sort, Match.Maybe([FieldSortPattern]));

    if (!me) {
      // User is not logged in, give back empty result
      return this.find({ members: "-1" }, { limit: 0 }) as Mongo.Cursor<TenantEntity, TenantModel>;
    }

    const find: Mongo.Selector<TenantEntity> = {};
    const options: Mongo.Options<TenantEntity> = { sort };

    // Only members of a tenant or admins can see a tenant
    if (!me.hasPrivilige("admin")) {
      find.members = me._id;
    }

    if (limit > 0) {
      options.limit = limit;
    }

    if (skip > 0) {
      options.skip = skip;
    }

    if (filter.adminOf) {
      find.admins = me._id;
    }

    return this.find(find, options) as Mongo.Cursor<TenantEntity, TenantModel>;
  }
}

export const Tenants = new TenantsCollection();
