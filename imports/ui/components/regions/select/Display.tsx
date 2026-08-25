import React from "react";
import { useTranslation } from "react-i18next";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

export function Display({
  className,
  onClick,
}: {
  className?: string | undefined;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();

  return (
    <li data-test="region-select-display" className={className}>
      <button
        className="btn btn-link nav-link text-white rounded-0 w-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
      >
        <i className="fa-solid fa-location-dot" />
        &nbsp;
        {currentRegion ? currentRegion.name : t("menue.All regions", "All regions")}
      </button>
    </li>
  );
}
