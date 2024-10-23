import { Mongo } from "meteor/mongo";
import { Regions } from "/imports/api/regions/regions";
// eslint-disable-next-line import/no-cycle
import { CourseEntity, Courses } from "/imports/api/courses/courses";
import { sum } from "../../utils/sum";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export async function onStartUp() {
  const updated = sum(
    await Promise.all(
      await Regions.find({}, { projection: { _id: 1, tenant: 1 } }).mapAsync((region) =>
        Courses.updateAsync(
          { region: region._id },
          { $set: { tenant: region.tenant } },
          { multi: true },
        ),
      ),
    ),
  );

  /* eslint-disable-next-line no-console */
  console.log(`courses.tenantDenormalizer.onStartUp: ${updated} affected courses`);
}

export async function beforeInsert(course: Mongo.OptionalId<CourseEntity>) {
  if (!course.region) {
    throw new Error("Unexpected falsy: course.region");
  }

  const region = await Regions.findOneAsync(course.region);

  if (!region) {
    throw new Error(`None matching region found for ${course.region}`);
  }

  return { ...course, tenant: region.tenant };
}
