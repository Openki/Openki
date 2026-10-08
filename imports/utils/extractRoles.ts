import { RegionModel } from "/imports/api/regions/regions";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { SystemRoles } from "/imports/api/groups/lib/Role";

export function extractRoles(region: RegionModel) {
  if (!region.roles?.length) {
    return PublicSettings.defaultRoles;
  }

  if (!region.roles.some((r) => r.id === SystemRoles.Team.id)) {
    // NOTE: The system expects a `team` role to exist, so we always need to add it.
    const teamRole = PublicSettings.defaultRoles.find((r) => r.id === SystemRoles.Team.id);

    if (!teamRole) {
      throw new Error("The team role must be defined in the PublicSettings");
    }

    return [...region.roles, teamRole];
  }

  return region.roles;
}
