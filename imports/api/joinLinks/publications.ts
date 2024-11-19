import { Meteor } from "meteor/meteor";

import { FindFilter, JoinLinks } from "/imports/api/joinLinks/joinLinks";
import { Tenants } from "/imports/api/tenants/tenants";

import { ServerPublish } from "/imports/utils/ServerPublishBlaze";
import { FieldSort } from "/imports/utils/sort-spec";

export const details = ServerPublish(
  "joinLink",
  (tenantId: string, token: string) => {
    const joinLink = JoinLinks.find({ tenant: tenantId, token });

    if (joinLink.count() === 0) {
      return undefined;
    }

    return [joinLink, Tenants.find(tenantId)];
  },
  (tenantId: string, token: string) => {
    const joinLink = JoinLinks.findOne({ tenant: tenantId, token });

    if (!joinLink) {
      return undefined;
    }

    return { joinLink, tenant: Tenants.findOne(tenantId) };
  },
);

export const findFilter = ServerPublish(
  "joinLinks.findFilter",
  (filter: FindFilter, limit?, skip?, sort?: FieldSort[]) => {
    const tenantId = filter.tenant;

    const user = Meteor.user();

    if (!user || !(user.privileged("admin") || (tenantId && user.isTenantAdmin(tenantId)))) {
      return undefined;
    }

    return JoinLinks.findFilter(filter, limit, skip, sort);
  },
);
