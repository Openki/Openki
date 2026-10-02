import { useTranslation } from "react-i18next";
import React from "react";

import { RegionModel } from "/imports/api/regions/regions";

import { useSessionEquals } from "/imports/ui/hooks/react-meteor-data";

import { FilterPreview } from "/imports/ui/lib/filter-preview";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import { MarkedName } from "/imports/utils/marked-name";
import { cx } from "/imports/utils/cx";

export function Option({
  region,
  search,
  onClick,
}: {
  region: RegionModel;
  search: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();

  const isCurrentRegion = useSessionEquals("region", region._id);

  function handleFocus(active: boolean) {
    if (!currentRegion) {
      FilterPreview({
        property: "region",
        id: region._id,
        activate: active,
      });
    }
  }

  return (
    <li
      data-test="region-select-option"
      className={cx(region.isPrivate() && "region-link-private")}
    >
      <a
        href="#"
        className={cx("dropdown-item", isCurrentRegion && "fw-bold")}
        title={region.nameEn}
        onClick={onClick}
        onMouseOver={() => handleFocus(true)}
        onMouseOut={() => handleFocus(false)}
        onFocus={() => handleFocus(true)}
        onBlur={() => handleFocus(false)}
      >
        <div className="dropdown-addon-right">
          <span
            className="badge bg-primary rounded-pill"
            title={t(
              "regions.groups.title",
              "{COUNT, plural, =0{no groups} one{one group} other{# groups in} } in {REGION}",
              { COUNT: region.groupCount, REGION: region.name },
            )}
          >
            {region.groupCount}
          </span>{" "}
          <span
            className="badge bg-success text-dark rounded-pill"
            title={t(
              "regions.eventCount.title",
              "{COUNT, plural, =0{no upcoming events} one{one upcoming event} other{# upcoming events} } in {REGION}",
              { COUNT: region.futureEventCount, REGION: region.name },
            )}
          >
            {region.futureEventCount}
          </span>
        </div>
        {isCurrentRegion && <span className="checkmark fa-solid fa-check"></span>}{" "}
        <MarkedName search={search} name={region.name} />
      </a>
    </li>
  );
}
