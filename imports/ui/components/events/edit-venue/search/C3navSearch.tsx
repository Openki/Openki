import React, { type FocusEventHandler } from "react";
import { filter, chain } from "lodash-es";

import { EventEntity, EventVenue } from "/imports/api/events/events";

import { SearchBase } from "/imports/ui/components/events/edit-venue/search/SearchBase";
import { useData } from "/imports/ui/hooks/useData";

async function requestVenuesFromC3nav(locations: any, query: string): Promise<EventVenue[]> {
  const relevantLocations = chain(locations)
    .filter((l) => !!l.point)
    .map((l) => ({
      level: l.point[0],
      loc: {
        type: "Point" as const,
        coordinates: [l.point[1], l.point[2]] as [long: number, lat: number],
      },

      address: l.subtitle,
      name: l.title,
      searchIndex: (l.title + " " + l.subtitle + " " + l.add_search).toUpperCase(),
    }))
    .value();

  query = query.toUpperCase();
  return filter(relevantLocations, (l) => l.searchIndex.includes(query));
}

export function C3navSearch({
  id,
  className,
  autofocus,
  region,
  venues,
  apiUrl,
  value,
  onChange,
  onBlur,
}: {
  id: string;
  className?: string | undefined;
  autofocus?: boolean | undefined;
  region: string;
  venues: string[];
  apiUrl: string;
  value: EventEntity["venue"] | undefined;
  onChange: (newValue: EventEntity["venue"]) => void;
  onBlur: FocusEventHandler<HTMLInputElement>;
}) {
  const locations = useData(apiUrl + "/map/locations/", {
    // The header is needed for c3nav
    headers: { "X-API-Key": "anonymous" },
  });

  async function handleRequest(query: string) {
    return await requestVenuesFromC3nav(locations, query);
  }

  return (
    <SearchBase
      id={id}
      className={className}
      autofocus={autofocus}
      region={region}
      venues={venues}
      onRequest={handleRequest}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
