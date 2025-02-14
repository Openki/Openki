import React, { useState } from "react";
import { useFindFilter } from "/imports/api/languages/publications";
import { Display } from "./language-display";
import { Selection } from "./language-selection";

export function LanguageSelectionWrap(props: { inNavbar?: boolean }) {
  const [searchingLanguages, setSearchingLanguages] = useState(false);

  useFindFilter({});

  function languageSelectionAttr() {
    return {
      inNavbar: props.inNavbar || false,
      onClose: () => {
        if (searchingLanguages) {
          setSearchingLanguages(false);
        }
      },
    };
  }
  function languageDisplayAttr() {
    return {
      inNavbar: props.inNavbar || false,
      onClick: () => {
        setSearchingLanguages(true);
      },
    };
  }

  if (searchingLanguages) {
    return <Selection {...languageSelectionAttr()} />;
  }
  return <Display {...languageDisplayAttr()} />;
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("LanguageSelectionWrap", () => LanguageSelectionWrap);
