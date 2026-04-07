import { Mongo } from "meteor/mongo";
import { GroupEntity, Groups } from "./courses";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

/**
 * Enrich the group entity with the modification date
 */
export function beforeInsert(group: Mongo.OptionalId<GroupEntity>) {
  return { ...group, time_lastedit: new Date() };
}

/**
 * Enrich the group entity with the modification date
 */
export function beforeUpdate(group: Mongo.OptionalId<GroupEntity>) {
  return { ...group, time_lastedit: new Date() };
}

/**
 * Enrich the group entity with the modification date
 */
export function beforeUpdateImage(update: { image: string; compactImage: string }) {
  return { ...update, time_lastedit: new Date() };
}

/**
 * Enrich the group entity with the modification date
 */
export function beforeDeleteImage() {
  return { time_lastedit: new Date() };
}

/**
 * Update the modification date
 */
export async function afterSubscribe(groupId: string) {
  await Groups.updateAsync(groupId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date
 */
export async function afterUnsubscribe(groupid: string) {
  await Groups.updateAsync(groupid, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date of the group
 */
export async function afterEventInsert(groupId: string) {
  await Groups.updateAsync(groupId, { $set: { time_lastedit: new Date() } });
}
