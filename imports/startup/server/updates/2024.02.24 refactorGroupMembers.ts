import { Groups } from "/imports/api/groups/groups";

export function update() {
  let updated = 0;

  Groups.find({})
    .fetch()
    .forEach((orginalGroup) => {
      const group = { ...orginalGroup };
      group.members = (group.members as unknown as string[]).map((m) => ({
        user: m,
        notify: true,
      }));

      updated += Groups.update(group._id, group);
    });

  return updated;
}
