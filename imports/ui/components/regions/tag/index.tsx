import React from "react";
import { useTranslation } from "react-i18next";

import { useAll } from "/imports/api/regions/publications";

import "./styles.scss";

export function Tag({ region }: { region: string }) {
  const { t } = useTranslation();
  const [isLoading, regions] = useAll();

  // do not show region name if only one region exists
  if (isLoading() || regions.length < 2) {
    return null;
  }

  const REGION = regions.find((r) => r._id === region)?.name;

  return (
    <div className="region-tag p-2 text-light d-flex align-items-center gap-1">
      <i className="fa-solid fa-location-dot" />
      <span className="small">{t("regionTag.inRegion", "in {REGION}", { REGION })}</span>
    </div>
  );
}
