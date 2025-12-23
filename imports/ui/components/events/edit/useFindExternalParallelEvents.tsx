import { useEffect, useState } from "react";
import { useLocalTimeZone } from "/imports/utils/local-time";

export function useFindExternalParallelEvents(
  regionId: string | undefined,
  venueId: string | undefined,
  event: {
    _id?: string | undefined;
    startLocal: string;
    endLocal: string;
  },
) {
  const [result, setResult] = useState<
    { id: string; summary: string; location: string; start: string; end: string; url: string }[]
  >([]);

  const regionZone = useLocalTimeZone({ when: !!regionId }, regionId);

  const start = regionZone
    ?.fromString(event.startLocal)
    /** fix that events that end and start a the same time detect as a collision  */
    .add(1, "minute")
    .toDate();
  const end = regionZone?.fromString(event.endLocal).toDate();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams();
      params.append("start", start?.toISOString() || "");
      params.append("end", end?.toISOString() || "");
      setResult(
        (await (await fetch(`/api/venue/${venueId}/external-bookings?${params}`)).json()).data,
      );
    })();
  }, [venueId, regionId, event.startLocal, event.endLocal]);

  return result;
}
