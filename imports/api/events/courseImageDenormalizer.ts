import { Groups } from "/imports/api/courses/courses";
import { Events, EventEntity } from "/imports/api/events/events";

export async function onStartUp() {
  let updated = 0;

  for (const event of (await Events.find({}).fetchAsync()).filter((e) => e.courseId)) {
    const course = await Groups.findOneAsync(event.courseId);
    if (!course) {
      throw new Error(`Missing course ${event.courseId} for event`);
    }

    const update = {
      $set: {
        courseImage: course.image,
        courseCompactImage: course.compactImage,
      },
    };

    await Events.updateAsync({ _id: event._id }, update);
    updated += 1;
  }

  console.log(`events.courseImageDenormalizer.onStartUp: ${updated} affected events`);
}

export async function beforeInsert(
  event: Omit<EventEntity, "_id">,
): Promise<Omit<EventEntity, "_id">> {
  if (!event.courseId) {
    return event;
  }

  const course = await Groups.findOneAsync(event.courseId);
  if (!course) {
    throw new Error(`Missing course ${event.courseId} for new event`);
  }

  return { ...event, courseImage: course.image, courseCompactImage: course.compactImage };
}

export async function afterGroupUpdateImage(
  courseId: string,
  set: { compactImage: string; image: string },
) {
  await Events.updateAsync(
    { courseId },
    { $set: { courseImage: set.image, courseCompactImage: set.compactImage } },
    { multi: true },
  );
}

export async function afterGroupDeleteImage(courseId: string) {
  await Events.updateAsync(
    { courseId },
    { $set: { courseImage: "", courseCompactImage: "" } },
    { multi: true },
  );
}
