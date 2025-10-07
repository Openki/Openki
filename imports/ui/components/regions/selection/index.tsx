import React, { useState } from "react";

import { useFindFilter } from "/imports/api/regions/publications";

import { RegionSelection, Props as RegionSelectionProps } from "./selection";
import { Display } from "./Display";

export function RegionSelectionWrap({
  inNavbar,
  isSplash,
  onSelect,
}: {
  inNavbar?: boolean | undefined;
  isSplash?: boolean | undefined;
  onSelect?: (() => void) | undefined;
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

  function regionSelectionAttr(): RegionSelectionProps {
    return {
      inNavbar,
      isSplash,
      onSelect,
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
