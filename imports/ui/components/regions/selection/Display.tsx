import React from "react";
import { useTranslation } from "react-i18next";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

export function Display(props: { inNavbar: boolean; onClick: () => void }) {
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();

  function inNavbarClasses() {
    if (props.inNavbar) {
      return "nav-item text-center col col-lg-auto";
    }
    return "";
  }

  return (
    <li className={inNavbarClasses()}>
      <a className="nav-link text-white" onClick={props.onClick}>
        <span className="fa-solid fa-location-dot" aria-hidden="true"></span>&nbsp;
        {currentRegion ? currentRegion.name : t("menue.All regions", "All regions")}
      </a>
    </li>
  );
}
