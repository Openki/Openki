import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

import { TenantEntity, Tenants } from "./tenants";
import { Users } from "/imports/api/users/users";
import * as usersTenantsDenormalizer from "/imports/api/users/tenantsDenormalizer";
import { ServerMethod } from "/imports/utils/ServerMethod";

export const create = ServerMethod("tenant.create", async (changes: Pick<TenantEntity, "name">) => {
  check(changes, {
    name: String,
  });

  const userId = Meteor.userId();
  if (!userId) {
    throw new Meteor.Error(401, "please log in");
  }

  const set: Pick<TenantEntity, "name" | "members" | "admins"> = {
    name: changes.name.trim().substring(0, 40),
    members: [userId],
    admins: [userId],
  };

  const tenantId = await Tenants.insertAsync(set);

  await usersTenantsDenormalizer.afterTenantCreate(userId, tenantId);

  return tenantId;
});

async function membershipMutationPreconditionCheck(userId: string, tenantId: string) {
  check(userId, String);
  check(tenantId, String);

  const senderId = Meteor.userId();
  if (!senderId) {
    throw new Meteor.Error(401, "Not permitted");
  }

  const tenant = await Tenants.findOneAsync(tenantId);
  if (!tenant) {
    throw new Meteor.Error(401, "Not permitted");
  }

  // Only current tenant admins (or instance admins) can draft other people into it
  if (!tenant.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "Not permitted");
  }

  if (!(await Users.findOneAsync(userId, { projection: { _id: 1 } }))) {
    throw new Meteor.Error(404, "User not found");
  }

  return tenant;
}

export const addMember = ServerMethod(
  "tenant.addMember",
  async (userId: string, tenantId: string) => {
    await membershipMutationPreconditionCheck(userId, tenantId);

    await Tenants.updateAsync(tenantId, { $addToSet: { members: userId } });

    await usersTenantsDenormalizer.afterTenantAddMember(userId, tenantId);
  },
);

export const removeMember = ServerMethod(
  "tenant.removeMember",
  async (userId: string, tenantId: string) => {
    const tenant = await membershipMutationPreconditionCheck(userId, tenantId);

    if (tenant.admins.includes(userId)) {
      throw new Meteor.Error(401, "Not permitted, delete the member from the admin list first");
    }

    await Tenants.updateAsync(tenantId, { $pull: { members: userId } });

    await usersTenantsDenormalizer.afterTenantRemoveMember(userId, tenantId);
  },
);

export const addAdmin = ServerMethod(
  "tenant.addAdmin",
  async (userId: string, tenantId: string) => {
    await membershipMutationPreconditionCheck(userId, tenantId);

    await Tenants.updateAsync(tenantId, { $addToSet: { admins: userId, members: userId } });

    await usersTenantsDenormalizer.afterTenantAddAdmin(userId, tenantId);
  },
);

export const removeAdmin = ServerMethod(
  "tenant.removeAdmin",
  async (userId: string, tenantId: string) => {
    await membershipMutationPreconditionCheck(userId, tenantId);

    await Tenants.updateAsync(tenantId, { $pull: { admins: userId } });

    await usersTenantsDenormalizer.afterTenantRemoveAdmin(userId, tenantId);
  },
);
