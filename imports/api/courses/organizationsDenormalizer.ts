import { Mongo } from "meteor/mongo";

import { CourseEntity, Courses } from "./courses";
import * as eventOrganizationsDenormalizer from "../events/organizationsDenormalizer";

/**
 * Recalculate the editors field
 */
export async function updateOrganizations(
  courseIdOrSelector: string | Mongo.Selector<CourseEntity>,
) {
  for (const course of await Courses.find(courseIdOrSelector).fetchAsync()) {
    const editors = course.organizationOrganizers.slice();

    course.members.forEach((member) => {
      if (member.roles.includes("team")) {
        editors.push(member.user);
      }
    });

    const update = { $set: { editors } };

    await Courses.updateAsync({ _id: course._id }, update);

    // At some point we'll have to figure out a proper caching hierarchy

    await eventOrganizationsDenormalizer.updateOrganizations({ courseId: course._id });
  }
}
