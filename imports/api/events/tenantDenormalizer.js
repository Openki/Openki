import Regions from '/imports/api/regions/regions';
// eslint-disable-next-line import/no-cycle
import Events from '/imports/api/events/events';
/** @typedef {import('./events').EventEntity} EventEntity */

const tenantDenormalizer = {
	onStartUp() {
		let updated = 0;

		Regions.find({}, { fields: { _id: 1, tenant: 1 } })
			.forEach((region) => {
				updated += Events.update({ region: region._id },
					{ $set: { tenant: region.tenant } },
					{ multi: true });
			});

		/* eslint-disable-next-line no-console */
		console.log(`events.tenantDenormalizer.onStartUp: ${updated} affected events`);
	},

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

export { tenantDenormalizer as default, tenantDenormalizer };
