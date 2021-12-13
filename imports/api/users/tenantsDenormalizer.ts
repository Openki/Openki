import { Tenants } from '../tenants/tenants';
import { Users } from './users';

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export function onStartUp() {
	let updated = 0;

	const tenants = Tenants.find({}, { fields: { _id: 1, members: 1, admins: 1 } }).fetch();

	Users.find({}, { fields: { _id: 1 } }).forEach((u) => {
		const userTenants = tenants
			.filter((t) => t.members.includes(u._id) || t.admins.includes(u._id))
			.map((t) => ({ _id: t._id, privileges: t.admins.includes(u._id) ? ['admin'] : [] }));

		updated += Users.update(u._id, { $set: { tenants: userTenants } });
	});

	/* eslint-disable-next-line no-console */
	console.log(`users.tenantsDenormalizer.onStartUp: ${updated} affected users`);
}

export function afterTenantCreate(userId: string, tenantId: string) {
	Users.update(userId, { $addToSet: { tenants: { _id: tenantId, privileges: ['admin'] } } });
}

export function afterTenantAddMember(userId: string, tenantId: string) {
	Users.update(userId, { $addToSet: { tenants: { _id: tenantId } } });
}

export function afterTenantRemoveMember(userId: string, tenantId: string) {
	Users.update(userId, { $pull: { tenants: { _id: tenantId } } });
}

export function afterTenantAddAdmin(userId: string, tenantId: string) {
	Users.update(userId, { $addToSet: { tenants: { _id: tenantId, privileges: ['admin'] } } });
}

export function afterTenantRemoveAdmin(userId: string, tenantId: string) {
	Users.update(
		{ _id: userId, 'tenants._id': tenantId },
		{ $pull: { 'tenants.$.privileges': 'admin' } },
	);
}

export function afterInvitationJoin(userId: string, tenantId: string) {
	Users.update(userId, { $addToSet: { tenants: { _id: tenantId } } });
}
