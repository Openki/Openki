import { Groups } from "/imports/api/groups/groups";

export async function update() {
  let updated = 0;

  for (const orginalGroup of await Groups.find({}).fetchAsync()) {
    const group = { ...orginalGroup };
    group.members = (group.members as unknown as string[]).map((m) => ({
      user: m,
      notify: true,
    }));

    updated += await Groups.updateAsync(group._id, group);
  }

  return updated;
}
