import React from "react";
import { useSession } from "/imports/utils/react-meteor-data";

import { LanguagesRaw } from "/imports/api/languages/languages";

export function Display(props: { inNavbar: boolean; onClick: () => void }) {
  const locale = useSession("locale");

  function inNavbarClasses() {
    if (props.inNavbar) {
      return "nav-item text-center col col-lg-auto";
    }
    return "";
  }
  function inNavbarClassesLink() {
    if (props.inNavbar) {
      return "text-white";
    }
    return "";
  }
  function setLanguage() {
    return LanguagesRaw[locale];
  }

  return (
    <li className={inNavbarClasses()}>
      <a
        className={`nav-link ${inNavbarClassesLink()}`}
        onClick={() => {
          props.onClick();
        }}
      >
        <span className="fa-solid fa-globe fa-fw" aria-hidden="true"></span> {setLanguage().short}
      </a>
    </li>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("LanguageDisplay", () => Display);
