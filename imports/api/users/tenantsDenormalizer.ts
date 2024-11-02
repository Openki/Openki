import { Tenants } from "/imports/api/tenants/tenants";
import { Users } from "./users";
import { sum } from "../../utils/sum";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export async function onStartUp() {
  const tenants = await Tenants.find(
    {},
    { projection: { _id: 1, members: 1, admins: 1 } },
  ).fetchAsync();

  const updated = sum(
    await Promise.all(
      await Users.find({}, { projection: { _id: 1 } }).mapAsync((u) => {
        const userTenants = tenants
          .filter((t) => t.members.includes(u._id) || t.admins.includes(u._id))
          .map((t) => ({ _id: t._id, privileges: t.admins.includes(u._id) ? ["admin"] : [] }));

        return Users.updateAsync(u._id, { $set: { tenants: userTenants } });
      }),
    ),
  );

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
    { $pull: { "tenants.$.privileges": "admin" } },
  );
}

export async function afterInvitationJoin(userId: string, tenantId: string) {
  await Users.updateAsync(userId, { $addToSet: { tenants: { _id: tenantId } } });
}

export async function afterJoinLinkJoin(userId: string, tenantId: string) {
  await Users.updateAsync(userId, { $addToSet: { tenants: { _id: tenantId } } });
}
