import { Groups } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";

export async function update() {
  let updated = 0;

  for (const group of await Groups.find({ image: { $exists: true } }).fetchAsync()) {
    updated += await Events.updateAsync(
      { courseId: group._id },
      { $set: { courseImage: group.image } },
      { multi: true },
    );
  }

  return updated;
}
