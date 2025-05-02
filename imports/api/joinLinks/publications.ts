import { Meteor } from "meteor/meteor";

import { FindFilter, JoinLinks } from "/imports/api/joinLinks/joinLinks";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";

export const [details, useDetails] = ServerPublishOne(
  "joinLink",
  async (tenantId: string, token: string) => JoinLinks.find({ tenant: tenantId, token }),
  (tenantId, token) => JoinLinks.findOne({ tenant: tenantId, token }),
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "joinLinks.findFilter",
  async (filter: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) => {
    const tenantId = filter.tenant;

    const user = await Meteor.userAsync();

    if (!user || !(user.privileged("admin") || (tenantId && user.isTenantAdmin(tenantId)))) {
      return JoinLinks.find({ _id: "-1" });
    }

    return JoinLinks.findFilter(filter, limit, skip, sort);
  },
  (filter, limit?, skip?, sort?) => {
    const tenantId = filter.tenant;

    const user = Meteor.user();

    if (!user || !(user.privileged("admin") || (tenantId && user.isTenantAdmin(tenantId)))) {
      return JoinLinks.find({ _id: "-1" });
    }

    return JoinLinks.findFilter(filter, limit, skip, sort);
  },
);
