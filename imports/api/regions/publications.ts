import { Meteor } from "meteor/meteor";

import { FindFilter, Regions } from "/imports/api/regions/regions";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";

import { visibleTenants, visibleTenantsAsync } from "/imports/utils/visible-tenants";

export const [all, useAll] = ServerPublishMany(
  "Regions",
  async () => Regions.find({ tenant: { $in: await visibleTenantsAsync() } }),
  () => Regions.find({ tenant: { $in: visibleTenants() } }),
);

export const [details, useDetails] = ServerPublishOne(
  "regionDetails",
  async (regionId: string) =>
    Regions.find({ _id: regionId, tenant: { $in: await visibleTenantsAsync() } }),
  (regionId) => Regions.findOne({ _id: regionId, tenant: { $in: visibleTenants() } }),
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Regions.findFilter",
  async (filter: FindFilter = {}, limit?: number, skip?: number, sort?: FieldSort[]) => {
    let tenants;
    const vt = await visibleTenantsAsync();
    if (filter.tenants) {
      if (!filter.tenants.every((t) => vt.includes(t))) {
        throw new Meteor.Error(401, "Not permitted");
      }
      tenants = filter.tenants;
    } else {
      tenants = vt;
    }

    return Regions.findFilter({ ...filter, tenants }, limit, skip, sort);
  },
  (filter = {}, limit?, skip?, sort?) => {
    let tenants;
    if (filter.tenants) {
      if (!filter.tenants.every((t) => visibleTenants().includes(t))) {
        throw new Meteor.Error(401, "Not permitted");
      }
      tenants = filter.tenants;
    } else {
      tenants = visibleTenants();
    }

    return Regions.findFilter({ ...filter, tenants }, limit, skip, sort);
  },
);
