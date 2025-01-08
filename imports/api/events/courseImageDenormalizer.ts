import { Courses } from "/imports/api/courses/courses";
import { Events, EventEntity } from "/imports/api/events/events";

export async function onStartUp() {
  let updated = 0;

  for (const event of (await Events.find({}).fetchAsync()).filter((e) => e.courseId)) {
    // eslint-disable-next-line no-await-in-loop
    const course = await Courses.findOneAsync(event.courseId);
    if (!course) {
      throw new Error(`Missing course ${event.courseId} for event`);
    }

    const update = {
      $set: {
        courseImage: course.image,
        courseCompactImage: course.compactImage,
      },
    };

    // eslint-disable-next-line no-await-in-loop
    await Events.updateAsync({ _id: event._id }, update);
    updated += 1;
  }

  /* eslint-disable-next-line no-console */
  console.log(`events.courseImageDenormalizer.onStartUp: ${updated} affected events`);
}

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
