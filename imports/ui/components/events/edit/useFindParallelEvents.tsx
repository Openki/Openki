import { useMemo } from "react";
import * as Events from "/imports/api/events/publications";
import { useLocalTimeZone } from "/imports/utils/local-time";

export function useFindParallelEvents(
  venueId: string | undefined,
  regionId: string | undefined,
  event: {
    _id?: string | undefined;
    startLocal: string;
    endLocal: string;
  },
) {
  const regionZone = useLocalTimeZone({ when: !!regionId }, regionId);

  const start = regionZone
    ?.fromString(event.startLocal)
    /** fix that events that end and start a the same time detect as a collision  */
    .add(1, "minute")
    .toDate();
  const end = regionZone?.fromString(event.endLocal).toDate();

  const [isLoading, events] = Events.useFindFilter(
    { when: !!venueId && !!regionZone },
    {
      venue: venueId,
      period: [start, end],
      canceled: false,
    },
  );

  // cache to prevent endless recalls
  return useMemo(() => {
    if (isLoading()) {
      return [];
    }

    /* ignore current event */
    return events?.filter((e) => e._id !== event._id) || [];
  }, [venueId, regionId, event._id, event.startLocal, event.endLocal, isLoading()]);
}
