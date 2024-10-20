import { useTranslation } from "react-i18next";
import React from "react";

import { RegionModel } from "/imports/api/regions/regions";

import * as StringTools from "/imports/utils/string-tools";
import { useSessionEquals } from "/imports/utils/react-meteor-data";

export function Item({ region, search }: { region: RegionModel; search: string }) {
  const { t } = useTranslation();

  const isCurrentRegion = useSessionEquals("region", region._id);

  function regionNameMarked() {
    return StringTools.markedName(search, region.name);
  }

  return (
    <li className={region.isPrivate() ? "region-link-private" : ""}>
      <a
        href="#"
        className={`dropdown-item js-region-link js-nav-dropdown-close ${
          isCurrentRegion ? "fw-bold" : ""
        }`}
        title={region.nameEn}
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
          </span>
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
        {isCurrentRegion ? <span className="checkmark fa-solid fa-check"></span> : null}
        {regionNameMarked()}
      </a>
    </li>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("RegionSelectionItem", () => Item);
