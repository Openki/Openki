import { useDetails } from "/imports/api/regions/publications";
import { RegionEntity } from "/imports/api/regions/regions";
import { PublicSettings, RoleEntity } from "/imports/utils/PublicSettings";

/**
 * Load the region roles on the client side
 */
export function useRegionRoles(regionId: RegionEntity["_id"]) {
  const [isLoading, region] = useDetails(regionId);

  let roles: RoleEntity[] = [];

  if (isLoading()) {
    return [isLoading, roles] as const;
  }

  if (!region) {
    throw new Error(`The current user can not view the regionId: "${regionId}"`);
  }

  if (!region.roles) {
    return [isLoading, PublicSettings.defaultRoles] as const;
  }

  if (region.roles.some((role) => role.id === "team")) {
    roles = region.roles;
  } else {
    // NOTE: The system expects a `team` role to exist, so we always need to add it.
    const [teamRole] = PublicSettings.defaultRoles.filter((r) => r.id === "team");
    roles = [...region.roles, teamRole] as const;
  }

  return [isLoading, roles] as const;
}
