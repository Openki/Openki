import { EventEntity, Events } from "/imports/api/events/events";
import { Groups } from "../groups/groups";
import { sum } from "../../utils/sum";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export async function onStartUp() {
  const updated = sum(
    await Promise.all(
      await Groups.find({}, { projection: { _id: 1, categories: 1 } }).mapAsync((course) =>
        Events.updateAsync(
          { courseId: course._id },
          { $set: { categories: course.categories || [] } },
          { multi: true },
        ),
      ),
    ),
  );

  console.log(`events.categoriesDenormalizer.onStartUp: ${updated} affected events`);
}

export async function beforeInsert(
  event: Omit<EventEntity, "_id">,
): Promise<Omit<EventEntity, "_id">> {
  // categories comes from the parent course
  const course = await Groups.findOneAsync(event.courseId);
  if (!course) {
    throw new Error(`Missing course ${event.courseId} for new event`);
  }

  return { ...event, categories: course.categories };
}

export async function afterGroupUpdateCategories(course: { _id: string; categories: string[] }) {
  await Events.updateAsync(
    { courseId: course._id },
    { $set: { categories: course.categories } },
    { multi: true },
  );
}
