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
 * @param {boolean} join
 */
export function afterTenantUpdateMembership(userId, tenantId, join) {
	if (Tenants.findOne(tenantId).admins.includes(userId)) {
		// is user also in the admin list then no update is needed
		return;
	}

	let update;
	if (join) {
		update = { $addToSet: { tenants: tenantId } };
	} else {
		update = { $pull: { tenants: tenantId } };
	}

	Users.update(userId, update);
}

/**
 * @param {string} userId
 * @param {string} tenantId
 * @param {boolean} join
 */
export function afterTenantUpdateAdminship(userId, tenantId, join) {
	if (Tenants.findOne(tenantId)?.members.includes(userId)) {
		// is user also in the member list then no update is needed
		return;
	}

	let update;
	if (join) {
		update = { $addToSet: { tenants: tenantId } };
	} else {
		update = { $pull: { tenants: tenantId } };
	}

	Users.update(userId, update);
}
