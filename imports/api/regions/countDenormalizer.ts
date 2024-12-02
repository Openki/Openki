import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

import { Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { Regions } from "./regions";

Meteor.methods({
  async "region.updateCounters"(selector) {
    // this denormalization is called every minutes for all regions in the server/update-db-cache.ts file, this ensures consistency.

    await Promise.all(
      await Regions.find(selector).mapAsync(async (region) => {
        const regionId = region._id;

        const courseCount = await Courses.find({
          region: regionId,
          internal: { $ne: true },
          archived: { $ne: true },
        }).countAsync();
        const futureEventCount = await Events.find({
          region: regionId,
          internal: { $ne: true },
          start: { $gte: new Date() },
        }).countAsync();

        await Regions.updateAsync(regionId, { $set: { courseCount, futureEventCount } });
      }),
    );
  },
});
