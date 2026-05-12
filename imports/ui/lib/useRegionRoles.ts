import { useAll } from "/imports/api/regions/publications";
import { RegionEntity } from "/imports/api/regions/regions";
import { PublicSettings, RoleEntity } from "/imports/utils/PublicSettings";

export function useRegionRoles(regionId?: RegionEntity["_id"] | undefined) {
  const [isLoading, regions] = useAll();

  let roles: RoleEntity[] = [];

  if (regionId) {
    const region = regions.find((r) => r._id === regionId);
    if (!region) {
      throw new Error(`Could not find region: ${regionId}`);
    }
    roles = region.roles ?? PublicSettings.defaultRoles;
  } else {
    roles = regions.flatMap((r) => r.roles ?? PublicSettings.defaultRoles);
  }

  return [isLoading, roles] as const;
}
