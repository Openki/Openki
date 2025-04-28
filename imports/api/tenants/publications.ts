import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

import { FindFilter, TenantEntity, Tenants } from "/imports/api/tenants/tenants";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";

export const [details, useDetails] = ServerPublishOne(
  "tenant",
  async (tenantId: string) => {
    check(tenantId, String);

    const user = await Meteor.userAsync();

    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const filter: Mongo.Selector<TenantEntity> = { _id: tenantId };

    // Only members of a tenant or admins can see a tenant
    if (!user.privileged("admin")) {
      filter.members = user._id;
    }

    const projection: Mongo.FieldSpecifier = { ...Tenants.publicFields };
    // Only admins can see all tenant admins. Note: Admin privileg is not something that is
    // likely to happen and reactive changes are not needed.
    if (user.privileged("admin") || user.isTenantAdmin(tenantId)) {
      projection.admins = 1;
    }
    return Tenants.find(filter, { projection });
  },
  (tenantId) => {
    const user = Meteor.user();

    if (!user) {
      return undefined;
    }

    const filter: Mongo.Selector<TenantEntity> = { _id: tenantId };

    // Only members of a tenant or admins can see a tenant
    if (!user.privileged("admin")) {
      filter.members = user._id;
    }

    const projection: Mongo.FieldSpecifier = { ...Tenants.publicFields };
    // Only admins can see all tenant admins. Note: Admin privileg is not something that is
    // likely to happen and reactive changes are not needed.
    if (user.privileged("admin") || user.isTenantAdmin(tenantId)) {
      projection.admins = 1;
    }
    return Tenants.findOne(filter, { projection });
  },
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Tenants.findFilter",
  async (find?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Tenants.findFilter(await Meteor.userAsync(), find, limit, skip, sort),
  (find?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Tenants.findFilter(Meteor.user(), find, limit, skip, sort),
);
