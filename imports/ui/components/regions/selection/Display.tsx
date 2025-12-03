import React from "react";
import { useTranslation } from "react-i18next";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

export function Display({
  inNavbar,
  onClick,
}: {
  inNavbar?: boolean | undefined;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();

  function inNavbarClasses() {
    if (inNavbar) {
      return "nav-item text-center col col-lg-auto";
    }
    return "";
  }

  return (
    <li data-test="region-selection-display" className={inNavbarClasses()}>
      <a
        className="nav-link text-white"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
      >
        <i className="fa-solid fa-location-dot" />
        &nbsp;
        {currentRegion ? currentRegion.name : t("menue.All regions", "All regions")}
      </a>
    </li>
  );
}
