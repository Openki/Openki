import { Meteor } from "meteor/meteor";

import { FindFilter, Invitations } from "/imports/api/invitations/invitations";
import { Tenants } from "/imports/api/tenants/tenants";

import { ServerPublish as ServerPublishBlaze } from "/imports/utils/ServerPublishBlaze";
import { ServerPublishMany } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";

export const details = ServerPublishBlaze(
  "invitation",
  async (tenantId: string, token: string) => {
    const invitation = Invitations.find({ tenant: tenantId, token });

    if ((await invitation.countAsync()) === 0) {
      return undefined;
    }

    return [invitation, Tenants.find(tenantId)];
  },
  (tenantId: string, token: string) => {
    const invitation = Invitations.findOne({ tenant: tenantId, token });

    if (!invitation) {
      return undefined;
    }

    return { invitation, tenant: Tenants.findOne(tenantId) };
  },
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "invitations.findFilter",
  async (filter?: FindFilter, limit?, skip?, sort?: FieldSort[]) => {
    const tenantId = filter?.tenant;

    const user = await Meteor.userAsync();

    if (!user || !(user.hasPrivilige("admin") || (tenantId && user.isTenantAdmin(tenantId)))) {
      throw new Meteor.Error(401, "not permitted");
    }

    return Invitations.findFilter(filter, limit, skip, sort);
  },
  (filter?: FindFilter, limit?, skip?, sort?: FieldSort[]) => {
    const tenantId = filter?.tenant;

    const user = Meteor.user();

    if (!user || !(user.hasPrivilige("admin") || (tenantId && user.isTenantAdmin(tenantId)))) {
      throw new Meteor.Error(401, "not permitted");
    }

    return Invitations.findFilter(filter, limit, skip, sort);
  },
);
