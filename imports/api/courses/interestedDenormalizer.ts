import { Mongo } from "meteor/mongo";

import { CourseEntity, Courses } from "./courses";

async function updateAsync(courseId: string) {
  const course = await Courses.findOneAsync(courseId);

  if (!course) {
    return;
  }

  await Courses.updateAsync(
    { _id: course._id },
    { $set: { interested: course.members?.length || 0 } },
  );
}

export function beforeInsert(course: Mongo.OptionalId<CourseEntity>) {
  return { ...course, interested: course.members.length };
}

export async function afterSubscribe(courseId: string) {
  await updateAsync(courseId);
}

export async function afterUnsubscribe(courseId: string) {
  await updateAsync(courseId);
}

export async function afterUserAdminRemove(courseId: string) {
  await updateAsync(courseId);
}
