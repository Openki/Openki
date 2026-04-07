import { Mongo } from "meteor/mongo";
import { Regions } from "/imports/api/regions/regions";

import { GroupEntity, Groups } from "/imports/api/courses/courses";
import { sum } from "../../utils/sum";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export async function onStartUp() {
  const updated = sum(
    await Promise.all(
      await Regions.find({}, { projection: { _id: 1, tenant: 1 } }).mapAsync((region) =>
        Groups.updateAsync(
          { region: region._id },
          { $set: { tenant: region.tenant } },
          { multi: true },
        ),
      ),
    ),
  );

  console.log(`courses.tenantDenormalizer.onStartUp: ${updated} affected groups`);
}

export async function beforeInsert(group: Mongo.OptionalId<GroupEntity>) {
  if (!group.region) {
    throw new Error("Unexpected falsy: course.region");
  }

  const region = await Regions.findOneAsync(group.region);

  if (!region) {
    throw new Error(`None matching region found for ${group.region}`);
  }

  return { ...group, tenant: region.tenant };
}
