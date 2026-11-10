import { RegionModel } from "./regions";
import { PublicSettings } from "../../utils/PublicSettings";
import { SystemRoles } from "../groups/lib/Role";

export function extractRoles(region: RegionModel) {
  if (!region.roles?.length) {
    return PublicSettings.defaultRoles;
  }

  if (!region.roles.some((role) => role.id === SystemRoles.Team.id)) {
    // NOTE: The system expects a `team` role to exist, so we always need to add it.
    const teamRole = PublicSettings.defaultRoles.find(
      (defaultRole) => defaultRole.id === SystemRoles.Team.id,
    );

    if (!teamRole) {
      throw new Error("The team role must be defined in the PublicSettings");
    }

    return [...region.roles, teamRole];
  }

  return region.roles;
}
