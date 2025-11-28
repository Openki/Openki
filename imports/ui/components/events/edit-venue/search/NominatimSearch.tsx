import React from "react";
import { map } from "lodash-es";

import { EventVenueEntity } from "/imports/api/events/events";
import * as Regions from "/imports/api/regions/publications";

import { RegionModel } from "/imports/api/regions/regions";
import { SearchBase } from "/imports/ui/components/events/edit-venue/search/SearchBase";

async function requestVenuesFromNominatim(
  region: RegionModel | undefined,
  query: string,
): Promise<EventVenueEntity[]> {
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
    const a = foundLocation.address;
    return {
      loc: {
        type: "Point" as const,
        coordinates: [
          Number.parseFloat(foundLocation.lon),
          Number.parseFloat(foundLocation.lat),
        ] as [long: number, lat: number],
      },
      address: [
        [a.road, a.house_number].filter((v) => v).join(" "),
        [a.postcode, a.state].filter((v) => v).join(" "),
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
  regionId,
  value,
  onChange,
}: {
  id: string;
  autofocus?: boolean | undefined;
  regionId: string;
  value: EventVenueEntity | undefined;
  onChange: (newValue: EventVenueEntity) => void;
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
      autofocus={autofocus}
      regionId={regionId}
      onRequest={handleRequest}
      value={value}
      onChange={onChange}
    />
  );
}
