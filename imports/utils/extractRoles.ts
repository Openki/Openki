import { Meteor } from "meteor/meteor";
import { RegionModel } from "/imports/api/regions/regions";
import { PublicSettings } from "/imports/utils/PublicSettings";

export function extractRoles(region: RegionModel | undefined) {
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
