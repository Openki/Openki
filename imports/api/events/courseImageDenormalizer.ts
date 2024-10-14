import { Courses } from "/imports/api/courses/courses";
import { Events, EventEntity } from "/imports/api/events/events";

export async function beforeInsert(
  event: Omit<EventEntity, "_id">,
): Promise<Omit<EventEntity, "_id">> {
  if (!event.courseId) {
    return event;
  }

  const course = await Courses.findOneAsync(event.courseId);
  if (!course) {
    throw new Error(`Missing course ${event.courseId} for new event`);
  }

  return { ...event, courseImage: course.image, courseCompactImage: course.compactImage };
}

export async function afterCourseUpdateImage(
  courseId: string,
  set: { compactImage: string; image: string },
) {
  await Events.updateAsync(
    { courseId },
    { $set: { courseImage: set.image, courseCompactImage: set.compactImage } },
    { multi: true },
  );
}

export async function afterCourseDeleteImage(courseId: string) {
  await Events.updateAsync(
    { courseId },
    { $set: { courseImage: "", courseCompactImage: "" } },
    { multi: true },
  );
}
