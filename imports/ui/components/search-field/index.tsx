import { _ } from "meteor/underscore";
import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from "react";
import { Template } from "meteor/templating";

import "./styles.scss";

export interface Props {
  search: string | undefined;
  onChange: (newValue: string) => void;
  onFocusOut?: () => void;
}

export function SearchField({ search, onChange, onFocusOut }: Props) {
  const [value, setValue] = useState(search ?? "");

  const { t } = useTranslation();

  // prevented unwanted input in the search
  const handleSearch = useCallback(
    _.debounce((newValue: string) => {
      setValue(newValue);
      onChange(newValue);
      // we don't updateURL() here, only after the field loses focus
    }, 200),
    [],
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setValue(newValue);
    handleSearch(newValue);
  }

  return (
    <div
      className="search-field"
      onChange={
        // Update the URI when the search-field was changed an loses focus

        () => onFocusOut?.()
      }
    >
      <div className="input-group input-group-lg">
        <input
          className="form-control search-input"
          type="text"
          id="find"
          value={value}
          placeholder={t("find.search_placeholder", "Everything")}
          onChange={handleChange}
          autoFocus
        />
        <button
          type="button"
          className="btn btn-success"
          onClick={(event) => {
            event.preventDefault();
            onChange(value);
            onFocusOut?.();
          }}
        >
          {t("find.search_go", "Go!")}
        </button>
      </div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("SearchField", () => SearchField);
