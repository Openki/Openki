import { Organizations } from "../../../api/organizations/organizations";

export async function update() {
  let updated = 0;

  for (const orginalGroup of await Organizations.find({}).fetchAsync()) {
    const group = { ...orginalGroup };
    group.members = (group.members as unknown as string[]).map((m) => ({
      user: m,
      notify: true,
    }));

    updated += await Organizations.updateAsync(group._id, group);
  }

  return updated;
}
