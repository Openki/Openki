import { Groups } from "../groups/groups";
import { Events, EventEntity } from "/imports/api/events/events";

export async function onStartUp() {
  let updated = 0;

  for (const event of (await Events.find({}).fetchAsync()).filter((e) => e.courseId)) {
    const group = await Groups.findOneAsync(event.courseId);
    if (!group) {
      throw new Error(`Missing course ${event.courseId} for event`);
    }

    const update = {
      $set: {
        courseImage: group.image,
        courseCompactImage: group.compactImage,
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
  if (!event.courseId) {
    return event;
  }

  const group = await Groups.findOneAsync(event.courseId);
  if (!group) {
    throw new Error(`Missing group ${event.courseId} for new event`);
  }

  return { ...event, courseImage: group.image, courseCompactImage: group.compactImage };
}

export async function afterGroupUpdateImage(
  groupId: string,
  set: { compactImage: string; image: string },
) {
  await Events.updateAsync(
    { courseId: groupId },
    { $set: { courseImage: set.image, courseCompactImage: set.compactImage } },
    { multi: true },
  );
}

export async function afterGroupDeleteImage(groupId: string) {
  await Events.updateAsync(
    { courseId: groupId },
    { $set: { courseImage: "", courseCompactImage: "" } },
    { multi: true },
  );
}
