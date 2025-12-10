import { useTracker } from "meteor/react-meteor-data";
import { Session } from "meteor/session";

import { Regions } from "/imports/api/regions/regions";
import * as Organizations from "../api/organizations/publications";

import { CleanedRegion } from "../ui/lib/cleaned-region";

export function useCurrentRegionId() {
  return useTracker(() => {
    const regionId = Session.get("region");

    return CleanedRegion(regionId);
  });
}

export function useCurrentRegion() {
  return useTracker(() => Regions.currentRegion());
}

export function useFeaturedOrganization() {
  return useTracker(() => {
    const currentRegion = Regions.currentRegion();

    if (currentRegion && currentRegion.featuredGroup) {
      return Organizations.details.subscribe(currentRegion.featuredGroup)();
    }
    return undefined;
  });
}
