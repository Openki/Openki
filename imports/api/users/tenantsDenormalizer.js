import { Tenants } from '../tenants/tenants';
import { Users } from './users';

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export function onStartUp() {
	let updated = 0;

	const tenants = Tenants.find({}, { fields: { _id: 1, members: 1, admins: 1 } }).fetch();

	Users.find({}, { fields: { _id: 1 } }).forEach((u) => {
		const userTenants = tenants
			.filter((t) => t.members.includes(u._id) || t.admins.includes(u._id))
			.map((t) => t._id);

		updated += Users.update(u._id, { $set: { tenants: userTenants } });
	});

	/* eslint-disable-next-line no-console */
	console.log(`users.tenantsDenormalizer.onStartUp: ${updated} affected users`);
}

/**
 * @param {string} userId
 * @param {string} tenantId
 */
export function afterTenantAddMember(userId, tenantId) {
	Users.update(userId, { $addToSet: { tenants: tenantId } });
}

/**
 * @param {string} userId
 * @param {string} tenantId
 */
export function afterTenantRemoveMember(userId, tenantId) {
	Users.update(userId, { $pull: { tenants: tenantId } });
}

/**
 * @param {string} userId
 * @param {string} tenantId
 */
export function afterTenantAddAdmin(userId, tenantId) {
	Users.update(userId, { $addToSet: { tenants: tenantId } });
}
