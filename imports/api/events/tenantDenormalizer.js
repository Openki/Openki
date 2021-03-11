/** @typedef {import('./events').EventEntity} EventEntity */
/** @typedef {import('../regions/regions').RegionEntity} RegionEntity */

export default {
	/**
     * @param {EventEntity} event
     * @param {import('../regions/regions').RegionEntity} region
     */
	enrich(event, region) {
		return { ...event, tenant: region.tenant };
	},
};
