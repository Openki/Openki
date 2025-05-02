import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

import { JoinLinks } from "/imports/api/joinLinks/joinLinks";

import { ServerPublishOne } from "/imports/utils/ServerPublish";

export const [details, useDetails] = ServerPublishOne(
  "joinLink",
  async function (tenantId: string, token?: string) {
    check(tenantId, String);

    if (token) {
      check(token, String);
      return JoinLinks.find({ tenant: tenantId, token });
    } else {
      const user = await Meteor.userAsync();

      if (!user || !(user.privileged("admin") || (tenantId && user.isTenantAdmin(tenantId)))) {
        return JoinLinks.find({ _id: "-1" });
      }

      return JoinLinks.findFilter({ tenant: tenantId });
    }
  },
  async function (tenantId: string, token?: string) {
    if (token) {
      return JoinLinks.findOne({ tenant: tenantId, token });
    } else {
      const user = await Meteor.userAsync();

      if (!user || !(user.privileged("admin") || (tenantId && user.isTenantAdmin(tenantId)))) {
        return JoinLinks.findOne({ _id: "-1" });
      }

      return JoinLinks.findOne({ tenant: tenantId });
    }
  },
);
