import { Meteor } from "meteor/meteor";

import { Regions } from "/imports/api/regions/regions";

import { PublicSettings } from "/imports/utils/PublicSettings";

export async function loadRoles(regionId: string) {
  const region = await Regions.findOneAsync({ _id: regionId });
  if (!region) {
    throw new Meteor.Error(404, "Region not found");
  }

  return region.roles ?? PublicSettings.rolesDefault;
}
