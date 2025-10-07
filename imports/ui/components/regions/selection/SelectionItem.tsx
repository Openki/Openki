import { useTranslation } from "react-i18next";
import React from "react";

import { RegionModel } from "/imports/api/regions/regions";

import { useSessionEquals } from "/imports/utils/react-meteor-data";

import { FilterPreview } from "/imports/ui/lib/filter-preview";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import { MarkedName } from "/imports/utils/marked-name";

export function SelectionItem({
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

  function handelFocus(active: boolean) {
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
      data-test="region-selection-item"
      className={region.isPrivate() ? "region-link-private" : ""}
    >
      <a
        href="#"
        className={`dropdown-item ${isCurrentRegion ? "fw-bold" : ""}`}
        title={region.nameEn}
        onClick={onClick}
        onMouseOver={() => handelFocus(true)}
        onMouseOut={() => handelFocus(false)}
        onFocus={() => handelFocus(true)}
        onBlur={() => handelFocus(false)}
      >
        <div className="dropdown-addon-right">
          <span
            className="badge bg-primary rounded-pill"
            title={t(
              "regions.courses.title",
              "{COUNT, plural, =0{no courses} one{one course} other{# courses in} } in {REGION}",
              { COUNT: region.courseCount, REGION: region.name },
            )}
          >
            {region.courseCount}
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
