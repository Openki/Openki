import { isObject } from "es-toolkit/compat";
import { useTracker } from "meteor/react-meteor-data";
import { LocalTime, Zone } from "/imports/utils/local-time";

/**
 * Get the local timezone for a region
 */
export function useLocalTimeZone(regionId: string): Zone;
export function useLocalTimeZone(
  condition: { when: boolean },
  regionId: string | undefined,
): Zone | undefined;
export function useLocalTimeZone(
  conditionOrRegionId: { when: boolean } | string,
  regionId?: string | undefined,
) {
  return useTracker(() => {
    const hasCondition = isObject(conditionOrRegionId) && "when" in conditionOrRegionId;
    if (hasCondition) {
      if (!conditionOrRegionId.when) {
        // return undefined when condition is false
        return undefined;
      } else {
        return LocalTime.zone(regionId as string);
      }
    }

    return LocalTime.zone(conditionOrRegionId);
  });
}
