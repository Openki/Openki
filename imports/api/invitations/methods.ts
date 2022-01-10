import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';

import { InvitationEntity, Invitations } from './invitations';
import { Tenants } from '/imports/api/tenants/tenants';
import { ServerMethod } from '/imports/utils/ServerMethod';
import * as usersTenantsDenormalizer from '/imports/api/users/tenantsDenormalizer';

function tenantMutationPreconditionCheck(tenantId: string) {
	check(tenantId, String);

	const tenant = Tenants.findOne(tenantId);
	if (!tenant) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	// Only current tenant admins (or instance admins) may draft other people into it
	if (!tenant.editableBy(Meteor.user())) {
		throw new Meteor.Error(401, 'Not permitted');
	}
}

export const createMany = ServerMethod(
	'invitation.createMany',
	(tenantId: string, emails: string[]) => {
		check(emails, [String]);

		tenantMutationPreconditionCheck(tenantId);

		const createdAt = new Date();
		const createdBy = Meteor.userId();

		emails
			.map(
				(e) =>
					({
						tenant: tenantId,
						to: e,
						token: Random.secret(),
						status: 'created',
						createdAt,
						createdBy,
					} as Mongo.OptionalId<InvitationEntity>),
			)
			.forEach((i) => {
				// Update or insert
				Invitations.upsert(
					{
						// Selector
						tenant: i.tenant,
						to: i.to,
					},
					{
						// Modifier
						$set: i,
						$unset: { acceptedBy: 1 },
					},
				);
			});
	},
);

export const remove = ServerMethod(
	'invitation.remove',
	(tenantId: string, invitationId: string) => {
		check(invitationId, String);

		tenantMutationPreconditionCheck(tenantId);

		Invitations.remove({ _id: invitationId, tenant: tenantId });
	},
);

export const join = ServerMethod('invitation.join', (tenantId: string, token: string) => {
	check(tenantId, String);
	check(token, String);

	const invitation = Invitations.findOne({ tenant: tenantId, token });
	if (!invitation || invitation.status === 'accepted') {
		throw new Meteor.Error(401, 'Not permitted');
	}

	const userId = Meteor.userId();
	if (!userId) {
		throw new Meteor.Error(401, 'please log in');
	}

	Tenants.update(tenantId, { $addToSet: { members: userId } });

	Invitations.update(invitation._id, { $set: { status: 'accepted', acceptedBy: userId } });

	usersTenantsDenormalizer.afterInvitationJoin(userId, tenantId);
});
