import Regions from '/imports/api/regions/regions';
/** @typedef {import('./events').EventEntity} EventEntity */

export default {
	/**
	 * @param {EventEntity} event
	 */
	beforeInsert(event) {
		if (!event.region) {
			throw new Error('Unexpected falsy: event.region');
		}

		const region = Regions.findOne(event.region);

		if (!region) {
			throw new Error(`None matching region found for ${event.region}`);
		}

		return { ...event, tenant: region.tenant };
	},
};
