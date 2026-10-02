import { extractRoles } from "../../utils/extractRoles";
import { useDetails } from "../../api/regions/publications";
import { RegionEntity } from "../../api/regions/regions";
import { RoleEntity } from "../../utils/PublicSettings";

/** Load the region roles on the client side. */
export function useRegionRoles(regionId: RegionEntity["_id"]) {
  const [isLoading, region] = useDetails(regionId);

  let roles: RoleEntity[] = [];

  if (isLoading()) {
    return [isLoading, roles, region] as const;
  }

  if (!region) {
    throw new Error(`The current user can not view the regionId: "${regionId}"`);
  }

  roles = extractRoles(region);

  return [isLoading, roles, region] as const;
}
