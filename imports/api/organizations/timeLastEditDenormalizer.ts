import { Mongo } from "meteor/mongo";
import { GroupEntity } from "./organizations";

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
export function beforeUpdateLogo(update: { logoUrl: string }) {
  return { ...update, time_lastedit: new Date() };
}

/**
 * Enrich the group entity with the modification date
 */
export function beforeDeleteLogo() {
  return { time_lastedit: new Date() };
}
