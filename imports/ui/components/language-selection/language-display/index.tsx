import React from "react";
import { useSession } from "/imports/utils/react-meteor-data";

import { LanguagesRaw } from "/imports/api/languages/languages";

export type Props = {
  inNavbar: boolean;
  onClick: () => void;
};

export function Display({ inNavbar, onClick }: Props) {
  const locale = useSession("locale");

  function inNavbarClasses() {
    if (inNavbar) {
      return "nav-item text-center col col-lg-auto";
    }
    return "";
  }
  function inNavbarClassesLink() {
    if (inNavbar) {
      return "text-white";
    }
    return "";
  }
  function setLanguage() {
    return LanguagesRaw[locale];
  }

  return (
    <div className={inNavbarClasses()}>
      <a
        className={`nav-link ${inNavbarClassesLink()}`}
        onClick={() => {
          onClick();
        }}
      >
        <span className="fa-solid fa-globe fa-fw" aria-hidden="true"></span> {setLanguage().short}
      </a>
    </div>
  );
}
