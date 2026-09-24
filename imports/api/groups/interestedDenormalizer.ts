import { Mongo } from "meteor/mongo";

import { GroupEntity, Groups } from "./groups";

async function updateAsync(groupId: string) {
  const group = await Groups.findOneAsync(groupId);

  if (!group) {
    return;
  }

  await Groups.updateAsync(
    { _id: group._id },
    { $set: { interested: group.members?.length || 0 } },
  );
}

export function beforeInsert(group: Mongo.OptionalId<GroupEntity>) {
  return { ...group, interested: group.members.length };
}

export async function afterSubscribeToRole(groupId: string) {
  await updateAsync(groupId);
}

export async function afterUnsubscribeFromRole(groupId: string) {
  await updateAsync(groupId);
}

export async function afterUserAdminRemove(groupId: string) {
  await updateAsync(groupId);
}
