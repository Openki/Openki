import React from "react";
import { useSession } from "/imports/utils/react-meteor-data";

import { LanguagesRaw } from "/imports/api/languages/languages";

export interface Props {
  inNavbar?: boolean | undefined;
  onClick: () => void;
}

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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
      >
        <i className="fa-solid fa-globe fa-fw" /> {setLanguage().short}
      </a>
    </div>
  );
}
