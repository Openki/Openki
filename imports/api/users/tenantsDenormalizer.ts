import { Tenants } from "/imports/api/tenants/tenants";
import { Users } from "./users";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export function onStartUp() {
  let updated = 0;

  const tenants = Tenants.find({}, { fields: { _id: 1, members: 1, admins: 1 } }).fetch();

  Users.find({}, { fields: { _id: 1 } }).forEach((u) => {
    const userTenants = tenants
      .filter((t) => t.members.includes(u._id) || t.admins.includes(u._id))
      .map((t) => ({ _id: t._id, privileges: t.admins.includes(u._id) ? ["admin"] : [] }));

    updated += Users.update(u._id, { $set: { tenants: userTenants } });
  });

  /* eslint-disable-next-line no-console */
  console.log(`users.tenantsDenormalizer.onStartUp: ${updated} affected users`);
}

export async function afterTenantCreate(userId: string, tenantId: string) {
  await Users.updateAsync(userId, {
    $addToSet: { tenants: { _id: tenantId, privileges: ["admin"] } },
  });
}

export async function afterTenantAddMember(userId: string, tenantId: string) {
  await Users.updateAsync(userId, { $addToSet: { tenants: { _id: tenantId } } });
}

export async function afterTenantRemoveMember(userId: string, tenantId: string) {
  await Users.updateAsync(userId, { $pull: { tenants: { _id: tenantId } } });
}

export async function afterTenantAddAdmin(userId: string, tenantId: string) {
  await Users.updateAsync(userId, {
    $addToSet: { tenants: { _id: tenantId, privileges: ["admin"] } },
  });
}

export async function afterTenantRemoveAdmin(userId: string, tenantId: string) {
  await Users.updateAsync(
    { _id: userId, "tenants._id": tenantId },
    { $pull: { "tenants.$.privileges": "admin" } }
  );
}

export async function afterInvitationJoin(userId: string, tenantId: string) {
  await Users.updateAsync(userId, { $addToSet: { tenants: { _id: tenantId } } });
}

export async function afterJoinLinkJoin(userId: string, tenantId: string) {
  await Users.updateAsync(userId, { $addToSet: { tenants: { _id: tenantId } } });
}
