import React, { useState } from "react";
import { useFindFilter } from "/imports/api/languages/publications";
import { Display } from "./Display";
import { Selection } from "./selection";

export function LanguageSelection(props: { inNavbar?: boolean }) {
  const [searchingLanguages, setSearchingLanguages] = useState(false);

  useFindFilter({});

  function selectionAttr() {
    return {
      inNavbar: props.inNavbar || false,
      onClose: () => {
        if (searchingLanguages) {
          setSearchingLanguages(false);
        }
      },
    };
  }
  function displayAttr() {
    return {
      inNavbar: props.inNavbar || false,
      onClick: () => {
        setSearchingLanguages(true);
      },
    };
  }

  if (searchingLanguages) {
    return <Selection {...selectionAttr()} />;
  }
  return <Display {...displayAttr()} />;
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("LanguageSelectionWrap", () => LanguageSelection);
