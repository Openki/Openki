import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Random } from "meteor/random";

import { JoinLinks } from "./joinLinks";
import { Tenants } from "/imports/api/tenants/tenants";
import { ServerMethod } from "/imports/utils/ServerMethod";
import * as usersTenantsDenormalizer from "/imports/api/users/tenantsDenormalizer";

export const create = ServerMethod("joinLinks.create", async (tenantId: string) => {
  check(tenantId, String);

  const tenant = await Tenants.findOneAsync(tenantId);
  if (!tenant) {
    throw new Meteor.Error(401, "Not permitted");
  }

  const user = await Meteor.userAsync();

  // Only current tenant admins (or instance admins) can draft other people into it
  if (!user || !tenant.editableBy(user)) {
    throw new Meteor.Error(401, "Not permitted");
  }

  const createdAt = new Date();
  const createdBy = user._id;

  // Update or insert
  await JoinLinks.upsertAsync(
    {
      // Selector
      tenant: tenantId,
    },
    {
      // Modifier
      $set: {
        tenant: tenantId,
        token: Random.secret(),
        createdAt,
        createdBy,
      },
    },
  );
});

export const remove = ServerMethod("joinLinks.remove", async (tenantId: string) => {
  check(tenantId, String);

  const tenant = await Tenants.findOneAsync(tenantId);
  if (!tenant) {
    throw new Meteor.Error(401, "Not permitted");
  }

  // Only current tenant admins (or instance admins) can draft other people into it
  if (!tenant.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "Not permitted");
  }

  await JoinLinks.removeAsync({ tenant: tenantId });
});

export const join = ServerMethod("joinLinks.join", async (tenantId: string, token: string) => {
  check(tenantId, String);
  check(token, String);

  const joinLink = await JoinLinks.findOneAsync({ tenant: tenantId, token });
  if (!joinLink) {
    throw new Meteor.Error(401, "Not permitted");
  }

  const userId = Meteor.userId();
  if (!userId) {
    throw new Meteor.Error(401, "please log in");
  }

  await Tenants.updateAsync(tenantId, { $addToSet: { members: userId } });

  await usersTenantsDenormalizer.afterJoinLinkJoin(userId, tenantId);
});
