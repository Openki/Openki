import { Groups } from "../groups/groups";
import { Events, EventEntity } from "/imports/api/events/events";

export async function onStartUp() {
  let updated = 0;

  for (const event of (await Events.find({}).fetchAsync()).filter((e) => e.groupId)) {
    const group = await Groups.findOneAsync(event.groupId);
    if (!group) {
      throw new Error(`Missing group ${event.groupId} for event`);
    }

    const update = {
      $set: {
        groupImage: group.image,
        groupCompactImage: group.compactImage,
      },
    };

    await Events.updateAsync({ _id: event._id }, update);
    updated += 1;
  }

  console.log(`events.groupImageDenormalizer.onStartUp: ${updated} affected events`);
}

export async function beforeInsert(
  event: Omit<EventEntity, "_id">,
): Promise<Omit<EventEntity, "_id">> {
  if (!event.groupId) {
    return event;
  }

  const group = await Groups.findOneAsync(event.groupId);
  if (!group) {
    throw new Error(`Missing group ${event.groupId} for new event`);
  }

  return { ...event, groupImage: group.image, groupCompactImage: group.compactImage };
}

export async function afterGroupUpdateImage(
  groupId: string,
  set: { compactImage: string; image: string },
) {
  await Events.updateAsync(
    { groupId },
    { $set: { groupImage: set.image, groupCompactImage: set.compactImage } },
    { multi: true },
  );
}

export async function afterGroupDeleteImage(groupId: string) {
  await Events.updateAsync(
    { groupId },
    { $set: { groupImage: "", groupCompactImage: "" } },
    { multi: true },
  );
}
