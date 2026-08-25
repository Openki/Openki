import React from "react";
import { useSession } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";

import { LanguagesRaw } from "/imports/api/languages/languages";

export interface Props {
  inNavbar?: boolean | undefined;
  onClick: () => void;
}

export function Display({ inNavbar, onClick }: Props) {
  const locale = useSession("locale");

  return (
    <div className={cx(inNavbar && "nav-item text-center col col-lg-auto")}>
      <button
        className={cx("btn btn-link", inNavbar && "nav-link rounded-0 text-white w-100")}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
      >
        <i className="fa-solid fa-globe fa-fw" /> {LanguagesRaw[locale].short}
      </button>
    </div>
  );
}
