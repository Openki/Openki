import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

import { JoinLinkEntity, JoinLinks } from "/imports/api/joinLinks/joinLinks";

import { ServerPublishOne } from "/imports/utils/ServerPublish";

export const [details, useDetails] = ServerPublishOne(
  "joinLink",
  async function (tenantId: string, token?: string) {
    check(tenantId, String);

    if (token) {
      check(token, String);
      return JoinLinks.find({ tenant: tenantId, token }) as Mongo.Cursor<JoinLinkEntity>;
    } else {
      const user = await Meteor.userAsync();

      if (!user || !(user.hasPrivilege("admin") || (tenantId && user.isTenantAdmin(tenantId)))) {
        return JoinLinks.find({ _id: "-1" }) as Mongo.Cursor<JoinLinkEntity>;
      }

      return JoinLinks.findFilter({ tenant: tenantId });
    }
  },
  function (tenantId: string, token?: string) {
    if (token) {
      return JoinLinks.findOne({ tenant: tenantId, token });
    } else {
      const user = Meteor.user();

      if (!user || !(user.hasPrivilege("admin") || (tenantId && user.isTenantAdmin(tenantId)))) {
        return undefined;
      }

      return JoinLinks.findOne({ tenant: tenantId });
    }
  },
);
