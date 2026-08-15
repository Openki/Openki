import { Regions } from "/imports/api/regions/regions";

import { extractRoles } from "/imports/utils/extractRoles";

/**
 * Server-side loading of roles
 */
export async function loadRoles(regionId: string) {
  const region = await Regions.findOneAsync({ _id: regionId });

  return extractRoles(region);
}
