import React, { FocusEventHandler } from "react";
import { map } from "lodash-es";

import { EventEntity, EventVenue } from "/imports/api/events/events";
import * as Regions from "/imports/api/regions/publications";

import { RegionModel } from "/imports/api/regions/regions";
import { SearchBase } from "/imports/ui/components/events/edit-venue/search/SearchBase";

async function requestVenuesFromNominatim(
  region: RegionModel | undefined,
  query: string,
): Promise<EventVenue[]> {
  const nominatimQuery: Record<string, any> = {
    format: "json",
    q: query,
    layer: "address,poi",
    addressdetails: "1",
    limit: 10,
  };

  if (region && region.loc) {
    nominatimQuery.viewbox = [
      region.loc.coordinates[0] - 0.1,
      region.loc.coordinates[1] + 0.1,
      region.loc.coordinates[0] + 0.1,
      region.loc.coordinates[1] - 0.1,
    ].join(",");
  }
  nominatimQuery.bounded = 1;

  const request = fetch(
    `https://nominatim.openstreetmap.org?${new URLSearchParams(nominatimQuery)}`,
  );

  const response = await request;
  const found = await response.json();

  return map(found, (foundLocation) => {
    const address = foundLocation.address;
    return {
      loc: {
        type: "Point" as const,
        coordinates: [
          Number.parseFloat(foundLocation.lon),
          Number.parseFloat(foundLocation.lat),
        ] as [long: number, lat: number],
      },
      address: [
        [address.road, address.house_number].filter((v) => v).join(" "),
        // Nominatim returns addresses at different granularities depending on the country.
        // For Switzerland (and similar), `state` is the Kanton (e.g. "Zürich"), which is
        // too coarse for postal addresses. We prefer finer-grained fields first:
        // city → municipality → town → village, falling back to state only if nothing else is available.
        // For Switzerland, `city` is the most relevant prop, based on this wiki page:
        // https://wiki.openstreetmap.org/wiki/Switzerland/Map_Features#Post_code_areas_and_addresses
        [
          address.postcode,
          address.city || address.municipality || address.town || address.village || address.state,
        ]
          .filter((v) => v)
          .join(" "),
      ]
        .filter((v) => v)
        .join(", "),
      name: foundLocation.name,
    };
  });
}

export function NominatimSearch({
  id,
  autofocus,
  className,
  region: regionId,
  venues,
  value,
  onChange,
  onBlur,
}: {
  id: string;
  className?: string | undefined;
  autofocus?: boolean | undefined;
  region: string;
  venues: string[];
  value: EventEntity["venue"] | undefined;
  onChange: (newValue: EventEntity["venue"]) => void;
  onBlur: FocusEventHandler<HTMLInputElement>;
}) {
  const [isLoadingRegion, region] = Regions.useDetails(regionId);

  async function handleRequest(query: string) {
    return await requestVenuesFromNominatim(region, query);
  }

  if (isLoadingRegion()) {
    return null;
  }

  return (
    <SearchBase
      id={id}
      className={className}
      autofocus={autofocus}
      region={regionId}
      venues={venues}
      onRequest={handleRequest}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
