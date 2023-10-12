import { useTracker } from "meteor/react-meteor-data";
import { Regions } from "/imports/api/regions/regions";
import * as Groups from "/imports/api/groups/publications";

export function useCurrentRegion() {
  return useTracker(() => Regions.currentRegion());
}

export function useFeaturedGroup() {
  return useTracker(() => {
    const currentRegion = Regions.currentRegion();

    if (currentRegion && currentRegion.featuredGroup) {
      return Groups.details.subscribe(currentRegion.featuredGroup)();
    }
    return undefined;
  });
}
