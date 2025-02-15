import React, { useState } from "react";

import { useFindFilter } from "/imports/api/regions/publications";

import { RegionSelection } from "..";
import { Display } from "../display";

export function RegionSelectionWrap({
  inNavbar = false,
  isSplash = false,
}: {
  inNavbar?: boolean;
  isSplash?: boolean;
}) {
  const [isLoading, regions] = useFindFilter({}, 2);

  const [searchingRegions, setSearchingRegions] = useState(false);

  function hasMultipleRegions() {
    return regions.length > 1;
  }

  function regionSelectionDisplayAttr() {
    return {
      inNavbar,
      onClick: () => {
        setSearchingRegions(true);
      },
    };
  }

  function regionSelectionAttr() {
    return {
      inNavbar,
      isSplash,
      onClose: () => {
        if (searchingRegions) {
          setSearchingRegions(false);
        }
      },
    };
  }

  if (isLoading() || !hasMultipleRegions()) {
    return null;
  }

  if (searchingRegions) {
    return <RegionSelection {...regionSelectionAttr()} />;
  }

  return <Display {...regionSelectionDisplayAttr()} />;
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("RegionSelectionWrap", () => RegionSelectionWrap);
