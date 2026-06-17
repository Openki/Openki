import { Mongo } from "meteor/mongo";
import { OrganizationEntity } from "./organizations";

// Based on the guide from meteor: https://docs.meteor.com/tutorials/collections/collections.html#abstracting-denormalizers

/**
 * Enrich the organization entity with the modification date
 */
export function beforeInsert(organization: Mongo.OptionalId<OrganizationEntity>) {
  return { ...organization, time_lastedit: new Date() };
}

/**
 * Enrich the organization entity with the modification date
 */
export function beforeUpdate(organization: Mongo.OptionalId<OrganizationEntity>) {
  return { ...organization, time_lastedit: new Date() };
}

/**
 * Enrich the organization entity with the modification date
 */
export function beforeUpdateLogo(update: { logoUrl: string }) {
  return { ...update, time_lastedit: new Date() };
}

/**
 * Enrich the organization entity with the modification date
 */
export function beforeDeleteLogo() {
  return { time_lastedit: new Date() };
}
