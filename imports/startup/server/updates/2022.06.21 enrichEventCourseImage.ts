import { Groups } from "/imports/api/groups/groups";
import { Events } from "/imports/api/events/events";

export async function update() {
  let updated = 0;

  for (const group of await Groups.find({ image: { $exists: true } }).fetchAsync()) {
    updated += await Events.updateAsync(
      { groupId: group._id },
      { $set: { groupImage: group.image } },
      { multi: true },
    );
  }

  return updated;
}
