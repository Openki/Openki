import React, { useState } from "react";
import { useFindFilter } from "/imports/api/languages/publications";
import { Display } from "./Display";
import { Selection, Props as SelectionProps } from "./selection";

export function LanguageSelection(props: {
  inNavbar?: boolean;
  onSelect?: (() => void) | undefined;
}) {
  const [searchingLanguages, setSearchingLanguages] = useState(false);

  useFindFilter({});

  function selectionAttr(): SelectionProps {
    return {
      inNavbar: props.inNavbar,
      onSelect: props.onSelect,
      onClose: () => {
        if (searchingLanguages) {
          setSearchingLanguages(false);
        }
      },
    };
  }
  function displayAttr() {
    return {
      inNavbar: props.inNavbar,
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
