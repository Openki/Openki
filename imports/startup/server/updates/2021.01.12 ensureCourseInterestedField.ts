import { Groups } from "../../../api/groups/groups";

export async function update() {
  let updated = 0;

  for (const originalGroup of await Groups.find({ interested: { $exists: false } }).fetchAsync()) {
    const group = { ...originalGroup };
    group.interested = group.members?.length || 0;

    updated += await Groups.updateAsync(group._id, group);
  }

  return updated;
}
