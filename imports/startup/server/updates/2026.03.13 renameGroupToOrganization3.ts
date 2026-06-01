import { Groups } from "/imports/api/groups/groups";

export async function update() {
  let updated = 0;

  for (const originalGroup of await Groups.find().fetchAsync()) {
    const group = { ...originalGroup };

    if (group.history) {
      group.history.forEach((e) => {
        if ("group" in e.data) {
          (e.data as any).organization = e.data.group;
          delete e.data.group;
        }
      });
      updated += await Groups.updateAsync(group._id, group);
    }
  }

  return updated;
}
