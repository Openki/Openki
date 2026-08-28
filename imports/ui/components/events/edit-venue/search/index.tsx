import React, { type FocusEventHandler } from "react";

import { EventEntity } from "/imports/api/events/events";
import * as Regions from "/imports/api/regions/publications";

import { NominatimSearch } from "/imports/ui/components/events/edit-venue/search/NominatimSearch";
import { C3navSearch } from "/imports/ui/components/events/edit-venue/search/C3navSearch";
import { SearchBase } from "/imports/ui/components/events/edit-venue/search/SearchBase";

export function Search(props: {
  id: string;
  className?: string | undefined;
  autofocus?: boolean | undefined;
  region: string;
  venues: string[];
  value: EventEntity["venue"] | undefined;
  onChange: (newValue: EventEntity["venue"]) => void;
  onBlur: FocusEventHandler<HTMLInputElement>;
}) {
  const [isLoadingRegion, region] = Regions.useDetails(props.region);

  if (isLoadingRegion()) {
    return null;
  }

  if (!region?.map) {
    return <NominatimSearch {...props} />;
  } else if (region.map.api === "c3nav") {
    if (!region.map.apiUrl) {
      throw new Error("Unexpected falsy: apiUrl should be set when api is set to 'c3nav'");
    }
    return <C3navSearch {...props} apiUrl={region.map.apiUrl} />;
  } else {
    return <SearchBase {...props} onRequest={async () => []} />;
  }
}
