import { Meteor } from "meteor/meteor";

import { Regions } from "/imports/api/regions/regions";

import { PublicSettings } from "/imports/utils/PublicSettings";

export async function loadRoles(regionId: string) {
  const region = await Regions.findOneAsync({ _id: regionId });
  if (!region) {
    throw new Meteor.Error(404, "Region not found");
  }

  // NOTE: The system expects a `team` role to exist, so we always need to add it.
  const [teamRole] = PublicSettings.rolesDefault.filter((r) => r.type === "team");

  return region.roles?.length ? [...region.roles, teamRole] : PublicSettings.rolesDefault;
}
