import { useMemo } from "react";
import * as Events from "/imports/api/events/publications";
import { useLocalTimeZone } from "/imports/utils/local-time";

export function useFindParallelEvents(
  regionId: string | undefined,
  venueId: string | undefined,
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

  const loaded = !isLoading();

  // cache to prevent endless recalls
  return useMemo(() => {
    if (!loaded) {
      return [];
    }

    /* ignore current event */
    return events?.filter((e) => e._id !== event._id) || [];
  }, [loaded, events, event._id]);
}
