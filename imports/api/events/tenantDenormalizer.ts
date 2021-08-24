import { Regions } from '/imports/api/regions/regions';
// eslint-disable-next-line import/no-cycle
import { EventEntity, Events } from '/imports/api/events/events';

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export function onStartUp() {
	let updated = 0;

	Regions.find({}, { fields: { _id: 1, tenant: 1 } }).forEach((region) => {
		updated += Events.update(
			{ region: region._id },
			{ $set: { tenant: region.tenant } },
			{ multi: true },
		);
	});

	/* eslint-disable-next-line no-console */
	console.log(`events.tenantDenormalizer.onStartUp: ${updated} affected events`);
}

export function beforeInsert(event: EventEntity) {
	if (!event.region) {
		throw new Error('Unexpected falsy: event.region');
	}

	const region = Regions.findOne(event.region);

	if (!region) {
		throw new Error(`None matching region found for ${event.region}`);
	}

	return { ...event, tenant: region.tenant };
}
