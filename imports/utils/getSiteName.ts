import { PublicSettings } from "./PublicSettings";
import { useCurrentRegion } from "./useCurrentRegion";
import { RegionModel } from "/imports/api/regions/regions";

export function getSiteName(region?: RegionModel): string {
  if (region?.custom?.siteName) {
    return region.custom.siteName;
  }

  return PublicSettings.siteName;
}

export function useSiteName() {
  const currentRegion = useCurrentRegion();
  return getSiteName(currentRegion);
}
