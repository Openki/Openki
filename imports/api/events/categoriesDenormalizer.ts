import { EventEntity, Events } from "/imports/api/events/events";
import { Groups } from "../groups/groups";
import { sum } from "../../utils/sum";

// Based on the guide from meteor: https://docs.meteor.com/tutorials/collections/collections.html#abstracting-denormalizers

export async function onStartUp() {
  const updated = sum(
    await Promise.all(
      await Groups.find({}, { projection: { _id: 1, categories: 1 } }).mapAsync((group) =>
        Events.updateAsync(
          { groupId: group._id },
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
  const group = await Groups.findOneAsync(event.groupId);
  if (!group) {
    throw new Error(`Missing group ${event.groupId} for new event`);
  }

  if (group.categories?.length) {
    return { ...event, categories: group.categories };
  }

  return event;
}

export async function afterGroupUpdateCategories(group: { _id: string; categories: string[] }) {
  await Events.updateAsync(
    { groupId: group._id },
    { $set: { categories: group.categories } },
    { multi: true },
  );
}
