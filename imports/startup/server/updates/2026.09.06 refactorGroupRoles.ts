import { Groups } from "/imports/api/groups/groups";

export async function update() {
  let updated = 0;

  for (const originalGroup of await Groups.find({}).fetchAsync()) {
    const group = { ...originalGroup };
    group.roles = (group.roles as unknown as string[]).map((r) => ({
      id: r,
      type: "predefined",
    })) as any;
    group.members = (group.members as unknown as { roles: string[] }[]).map((m) => ({
      ...m,
      roles: m.roles.map((r) => ({
        id: r,
        type: "predefined",
      })),
    })) as any;

    updated += await Groups.updateAsync(group._id, group);
  }

  return updated;
}
