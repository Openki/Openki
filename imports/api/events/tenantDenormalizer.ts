import { Mongo } from "meteor/mongo";
import { sum } from "../../utils/sum";

import { Regions } from "/imports/api/regions/regions";

import { EventEntity, Events } from "/imports/api/events/events";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export async function onStartUp() {
  const updated = sum(
    await Promise.all(
      await Regions.find({}, { projection: { _id: 1, tenant: 1 } }).mapAsync((region) =>
        Events.updateAsync(
          { region: region._id },
          { $set: { tenant: region.tenant } },
          { multi: true },
        ),
      ),
    ),
  );

  /* eslint-disable-next-line no-console */
  console.log(`events.tenantDenormalizer.onStartUp: ${updated} affected events`);
}

export async function beforeInsert(event: Omit<Mongo.OptionalId<EventEntity>, "tenant">) {
  if (!event.region) {
    throw new Error("Unexpected falsy: event.region");
  }

  const region = await Regions.findOneAsync(event.region);

  if (!region) {
    throw new Error(`None matching region found for ${event.region}`);
  }

  return { ...event, tenant: region.tenant };
}
