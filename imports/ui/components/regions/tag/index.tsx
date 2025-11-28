import React from "react";
import { useTranslation } from "react-i18next";

import { useAll } from "/imports/api/regions/publications";

import "./styles.scss";

export function Tag(props: { region: string }) {
  const { t } = useTranslation();
  const [isLoading, regions] = useAll();

  function regionName(region: string) {
    return regions.find((r) => r._id === region)?.name;
  }

  // do not show region name if only one region exists
  if (!isLoading() && regions.length > 1) {
    return (
      <div className="region-tag p-2 text-light">
        <i className="fa-solid fa-location-dot" />
        &nbsp;
        {t("regionTag.inRegion", "in {REGION}", { REGION: regionName(props.region) })}
      </div>
    );
  }

  return null;
}
