import { Tenants } from '../tenants/tenants';
import { Users } from './users';

const tenantsDenormalizer = {
	onStartUp() {
		let updated = 0;

		const tenants = Tenants.find({}, { fields: { _id: 1, members: 1 } }).fetch();

		Users.find({}, { fields: { _id: 1 } }).forEach((u) => {
			const userTenants = tenants.filter((t) => t.members.includes(u._id))
				.map((t) => t._id);

			updated += Users.update(u._id, { $set: { tenants: userTenants } });
		});

		/* eslint-disable-next-line no-console */
		console.log(`users.tenantsDenormalizer.onStartUp: ${updated} affected users`);
	},

	/**
	 * @param {string} userId
	 * @param {string} tenantId
	 * @param {boolean} join
	 */
	afterTenantUpdateMembership(userId, tenantId, join) {
		let update;
		if (join) {
			update = { $addToSet: { tenants: tenantId } };
		} else {
			update = { $pull: { tenants: tenantId } };
		}

		Users.update(userId, update);
	},
};

export { tenantsDenormalizer as default, tenantsDenormalizer };
