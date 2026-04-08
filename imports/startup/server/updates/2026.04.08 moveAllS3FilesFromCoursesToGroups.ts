import { Groups } from "/imports/api/groups/groups";
import * as FileStorage from "/imports/utils/FileStorage";

export async function update() {
  await FileStorage.renameDirectory("courses", "groups");

  let updated = 0;

  for (const originalGroup of await Groups.find({
    image: { $exists: true },
  }).fetchAsync()) {
    const group = { ...originalGroup };

    group.image = (group.image as string).replace(/^courses/, "groups");

    updated += await Groups.updateAsync(group._id, group);
  }

  for (const originalGroup of await Groups.find({
    compactImage: { $exists: true },
  }).fetchAsync()) {
    const group = { ...originalGroup };

    group.compactImage = (group.compactImage as string).replace(/^courses/, "groups");

    updated += await Groups.updateAsync(group._id, group);
  }

  return updated;
}
