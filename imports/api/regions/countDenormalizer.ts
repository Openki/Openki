import { Mongo } from "meteor/mongo";

import { Groups } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { RegionEntity, Regions } from "./regions";

export async function updateCounters(regionIdOrSelector: string | Mongo.Selector<RegionEntity>) {
  // this denormalization is called every minutes for all regions in the server/update-db-cache.ts file, this ensures consistency.

  await Promise.all(
    await Regions.find(regionIdOrSelector).mapAsync(async (region) => {
      const regionId = region._id;

      const courseCount = await Groups.countDocuments({
        region: regionId,
        internal: { $ne: true },
        archived: { $ne: true },
      });
      const futureEventCount = await Events.countDocuments({
        region: regionId,
        internal: { $ne: true },
        start: { $gte: new Date() },
      });

      await Regions.updateAsync(regionId, { $set: { courseCount, futureEventCount } });
    }),
  );
}
