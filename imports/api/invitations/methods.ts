import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Random } from "meteor/random";

import { InvitationEntity, Invitations } from "./invitations";
import { Tenants } from "/imports/api/tenants/tenants";
import { ServerMethod } from "/imports/utils/ServerMethod";
import * as usersTenantsDenormalizer from "/imports/api/users/tenantsDenormalizer";

async function tenantMutationPreconditionCheck(tenantId: string) {
  check(tenantId, String);

  const tenant = await Tenants.findOneAsync(tenantId);
  if (!tenant) {
    throw new Meteor.Error(401, "Not permitted");
  }

  // Only current tenant admins (or instance admins) can draft other people into it
  if (!tenant.editableBy(await Meteor.userAsync())) {
    throw new Meteor.Error(401, "Not permitted");
  }
}

export const createMany = ServerMethod(
  "invitation.createMany",
  async (tenantId: string, emails: string[]) => {
    check(tenantId, String);
    check(emails, [String]);

    await tenantMutationPreconditionCheck(tenantId);

    const createdAt = new Date();
    const createdBy = Meteor.userId();

    for await (const i of emails.map(
      (e) =>
        ({
          tenant: tenantId,
          to: e,
          token: Random.secret(),
          status: "created",
          createdAt,
          createdBy,
        }) as Mongo.OptionalId<InvitationEntity>,
    )) {
      // Update or insert
      await Invitations.upsertAsync(
        // Selector
        { tenant: i.tenant, to: i.to },
        // Modifier
        { $set: i, $unset: { acceptedBy: true } },
      );
    }
  },
);

export const remove = ServerMethod(
  "invitation.remove",
  async (tenantId: string, invitationId: string) => {
    check(invitationId, String);

    await tenantMutationPreconditionCheck(tenantId);

    await Invitations.removeAsync({ _id: invitationId, tenant: tenantId });
  },
);

export const join = ServerMethod("invitation.join", async (tenantId: string, token: string) => {
  check(tenantId, String);
  check(token, String);

  const invitation = await Invitations.findOneAsync({ tenant: tenantId, token });
  if (!invitation || invitation.status === "accepted") {
    throw new Meteor.Error(401, "Not permitted");
  }

  const userId = Meteor.userId();
  if (!userId) {
    throw new Meteor.Error(401, "please log in");
  }

  await Tenants.updateAsync(tenantId, { $addToSet: { members: userId } });

  await Invitations.updateAsync(invitation._id, {
    $set: { status: "accepted", acceptedBy: userId },
  });

  await usersTenantsDenormalizer.afterInvitationJoin(userId, tenantId);
});
