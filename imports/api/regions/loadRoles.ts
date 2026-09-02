import { Meteor } from "meteor/meteor";

import { Regions } from "/imports/api/regions/regions";

import { PublicSettings } from "/imports/utils/PublicSettings";

/**
 * Server-side loading of roles
 */
export async function loadRoles(regionId: string) {
  const region = await Regions.findOneAsync({ _id: regionId });
  if (!region) {
    throw new Meteor.Error(404, "Region not found");
  }

  if (!region.roles?.length) {
    return PublicSettings.defaultRoles;
  }

  if (!region.roles.some((r) => r.id === "team")) {
    // NOTE: The system expects a `team` role to exist, so we always need to add it.
    const [teamRole] = PublicSettings.defaultRoles.filter((r) => r.id === "team");

    return [...region.roles, teamRole];
  }

  return region.roles;
}
