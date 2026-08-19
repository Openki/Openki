import { Mongo } from "meteor/mongo";
import { GroupEntity, Groups } from "./groups";

// Based on the guide from meteor: https://docs.meteor.com/tutorials/collections/collections.html#abstracting-denormalizers

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
export async function afterSubscribeToRole(groupId: string) {
  await Groups.updateAsync(groupId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date
 */
export async function afterUnsubscribeFromRole(groupId: string) {
  await Groups.updateAsync(groupId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date
 */
export async function afterSubscribeToCustomRole(groupId: string) {
  await Groups.updateAsync(groupId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date
 */
export async function afterUnsubscribeFromCustomRole(groupId: string) {
  await Groups.updateAsync(groupId, { $set: { time_lastedit: new Date() } });
}

/**
 * Update the modification date of the group
 */
export async function afterEventInsert(groupId: string) {
  await Groups.updateAsync(groupId, { $set: { time_lastedit: new Date() } });
}
