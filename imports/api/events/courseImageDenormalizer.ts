import { Courses } from "/imports/api/courses/courses";
import { Events, EventEntity } from "/imports/api/events/events";

export async function beforeInsert(event: EventEntity): Promise<EventEntity> {
  if (!event.courseId) {
    return event;
  }

  const course = await Courses.findOneAsync(event.courseId);
  if (!course) {
    throw new Error(`Missing course ${event.courseId} for event ${event._id}`);
  }

  return { ...event, courseImage: course.image };
}

export async function afterCourseUpdateImage(courseId: string, image: string) {
  await Events.updateAsync({ courseId }, { $set: { courseImage: image } }, { multi: true });
}

export async function afterCourseDeleteImage(courseId: string) {
  await Events.updateAsync({ courseId }, { $set: { courseImage: "" } }, { multi: true });
}
