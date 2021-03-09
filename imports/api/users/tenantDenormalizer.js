export default {
	/**
	 * @param {string} userId
	 * @param {string} tenantId
	 * @param {boolean} join
	 */
	afterUpdateMembership(userId, tenantId, join) {
		let update;
		if (join) {
			update = { $addToSet: { tenants: tenantId } };
		} else {
			update = { $pull: { tenants: tenantId } };
		}

		Meteor.users.update(userId, update);
	},
};
