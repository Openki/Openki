import { debounce } from "lodash-es";
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from "react";

import "./styles.scss";

export interface Props {
  search: string;
  onChange: (newValue: string) => void;
  onGo?: () => void;
  variant?: string | undefined;
}

export function SearchField({ search, variant = "success", onChange, onGo }: Props) {
  const { t } = useTranslation();

  const [value, setValue] = useState(search);

  // URL/parent changed -> synchronize the input.
  useEffect(() => {
    setValue(search);
  }, [search]);

  const debouncedOnChange = useMemo(
    () =>
      debounce((newValue: string) => {
        onChange(newValue);
      }, 200),
    [onChange],
  );

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.currentTarget.value;

    // Update input immediately.
    setValue(newValue);

    // Search after 200ms.
    debouncedOnChange(newValue);
  }

  return (
    <form
      className="search-field"
      onSubmit={(event) => {
        event.preventDefault();
        onGo?.();
      }}
    >
      <div className="input-group input-group-lg">
        <input
          className="form-control fs-5"
          type="search"
          id="find"
          value={value}
          placeholder={t("find.search_placeholder", "Everything")}
          onChange={handleChange}
          autoFocus
        />
        <button type="submit" className={`btn btn-${variant}`}>
          {t("find.search_go", "Go!")}
        </button>
      </div>
    </form>
  );
}
