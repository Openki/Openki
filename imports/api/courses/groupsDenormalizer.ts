import { Mongo } from "meteor/mongo";

import { CourseEntity, Courses } from "../courses/courses";
import * as eventGroupsDenormalizer from "/imports/api/events/groupsDenormalizer";

export async function updateGroups(courseIdOrSelector: string | Mongo.Selector<CourseEntity>) {
  for (const course of await Courses.find(courseIdOrSelector).fetchAsync()) {
    const editors = course.groupOrganizers.slice();

    course.members.forEach((member) => {
      if (member.roles.includes("team")) {
        editors.push(member.user);
      }
    });

    const update = { $set: { editors } };

    // eslint-disable-next-line no-await-in-loop
    await Courses.updateAsync({ _id: course._id }, update);

    // At some point we'll have to figure out a proper caching hierarchy
    eventGroupsDenormalizer.updateGroups({ courseId: course._id });
  }
}
