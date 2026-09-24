import { Regions } from "/imports/api/regions/regions";

import { extractRoles } from "/imports/utils/extractRoles";

/**
 * Server-side loading of roles
 */
export async function loadRoles(regionId: string) {
  const region = await Regions.findOneAsync({ _id: regionId });

  if (!region) {
    throw new Meteor.Error(404, "Region not found");
  }

  return extractRoles(region);
}
