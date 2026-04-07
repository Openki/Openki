import { check } from "meteor/check";

import { Groups, FindFilter } from "./groups";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";
import { visibleTenants, visibleTenantsAsync } from "/imports/utils/visible-tenants";

export const [details, useDetails] = ServerPublishOne(
  "groupDetails",
  async (groupId: string) => {
    check(groupId, String);

    return Groups.find({ _id: groupId, tenant: { $in: await visibleTenantsAsync() } });
  },
  (groupId) => Groups.findOne({ _id: groupId, tenant: { $in: visibleTenants() } }),
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Groups.findFilter",
  async (filter?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Groups.findFilter({ ...filter, tenants: await visibleTenantsAsync() }, limit, skip, sort),
  (filter?, limit?, skip?, sort?) =>
    Groups.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sort),
);
