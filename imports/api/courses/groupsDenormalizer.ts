import { Courses } from "../courses/courses";
import * as eventGroupsDenormalizer from "/imports/api/events/groupsDenormalizer";

export async function updateGroups(courseId: string) {
  const course = Courses.findOne(courseId);

  if (!course) {
    // If the course doesn't exist it doesn't need updating
    return;
  }

  const editors = course.groupOrganizers.slice();

  course.members.forEach((member) => {
    if (member.roles.includes("team")) {
      editors.push(member.user);
    }
  });

  const update = { $set: { editors } };

  await Courses.updateAsync({ _id: course._id }, update);

  // At some point we'll have to figure out a proper caching hierarchy
  eventGroupsDenormalizer.updateGroups({ courseId });
}
