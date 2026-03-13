import { Mongo } from "meteor/mongo";

import { CourseEntity, Courses } from "./courses";
import * as eventOrganizationsAndEditorsDenormalizer from "../events/organizationsAndEditorsDenormalizer";

/**
 * Recalculate the editors field
 */
export async function updateEditors(courseIdOrSelector: string | Mongo.Selector<CourseEntity>) {
  for (const course of await Courses.find(courseIdOrSelector).fetchAsync()) {
    const editors = course.teamOrganizations.slice();

    course.members.forEach((member) => {
      if (member.roles.includes("team")) {
        editors.push(member.user);
      }
    });

    const update = { $set: { editors } };

    await Courses.updateAsync({ _id: course._id }, update);

    // At some point we'll have to figure out a proper caching hierarchy

    await eventOrganizationsAndEditorsDenormalizer.updateOrganizationsAndEditors({
      courseId: course._id,
    });
  }
}
