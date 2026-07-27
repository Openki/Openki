import { debounce } from "lodash-es";
import { useTranslation } from "react-i18next";
import React, { useMemo } from "react";

import "./styles.scss";

export interface Props {
  search: string | undefined;
  onChange: (newValue: string) => void;
  onGo?: () => void;
  color?: string | undefined;
}

export function SearchField({ search, color, onChange, onGo }: Props) {
  const { t } = useTranslation();

  // prevented unwanted input in the search
  const handleSearch = useMemo(
    () =>
      debounce((newValue: string) => {
        onChange(newValue);
      }, 200),
    [onChange],
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>,
  ) {
    const newValue = e.currentTarget.value;
    handleSearch(newValue);
  }

  return (
    <div className="search-field">
      <div className="input-group input-group-lg">
        <input
          className="form-control search-input"
          type="search"
          id="find"
          defaultValue={search}
          placeholder={t("find.search_placeholder", "Everything")}
          onChange={handleChange}
          // fix: onChange do not catch everything eg. when value is set over url and get deleted all at once
          onKeyUp={handleChange}
          autoFocus
        />
        <button
          type="button"
          className={"btn btn-" + (color || "success")}
          onClick={(event) => {
            event.preventDefault();
            onGo?.();
          }}
        >
          {t("find.search_go", "Go!")}
        </button>
      </div>
    </div>
  );
}
