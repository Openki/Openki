import { Groups } from "/imports/api/groups/groups";

export async function update() {
  let updated = 0;

  for (const originalGroup of await Groups.find({ archived: { $exists: false } }).fetchAsync()) {
    const group = { ...originalGroup };
    group.archived = false;

    updated += await Groups.updateAsync(group._id, group);
  }

  return updated;
}
