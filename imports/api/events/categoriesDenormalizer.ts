import { EventEntity, Events } from "/imports/api/events/events";
import { Groups } from "../groups/groups";
import { sum } from "../../utils/sum";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export async function onStartUp() {
  const updated = sum(
    await Promise.all(
      await Groups.find({}, { projection: { _id: 1, categories: 1 } }).mapAsync((group) =>
        Events.updateAsync(
          { courseId: group._id },
          { $set: { categories: group.categories || [] } },
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
  // categories comes from the parent group
  const group = await Groups.findOneAsync(event.courseId);
  if (!group) {
    throw new Error(`Missing group ${event.courseId} for new event`);
  }

  return { ...event, categories: group.categories };
}

export async function afterGroupUpdateCategories(group: { _id: string; categories: string[] }) {
  await Events.updateAsync(
    { courseId: group._id },
    { $set: { categories: group.categories } },
    { multi: true },
  );
}
