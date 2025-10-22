import { omit } from "lodash";
import { JSX, useState } from "react";

export type Mapping<T extends string> = Record<
  string,
  {
    field: T;
    onCheckValidity?: () => boolean;
    text: () => string | JSX.Element | undefined | null;
  }
>;

export function useValidation<T extends string>(mapping: Mapping<T>, initialCheck = false) {
  const initialState: Partial<Record<T, string | JSX.Element | undefined | null>> = {};

  if (initialCheck) {
    Object.values(mapping).forEach((m) => {
      if (m.onCheckValidity && !m.onCheckValidity()) {
        initialState[m.field] = m.text();
      }
    });
  }

  const [errors, setErrors] = useState(initialState);

  const add = (key: string) => {
    const m = mapping[key];
    if (!m) {
      // unknown error, you should handle it differently
      return false;
    }

    const field = m.field;
    setErrors((e) => ({
      ...e,
      [field]: m.text() || key,
    }));

    return true;
  };

  const resetErrors = (field?: T) => {
    if (field) {
      setErrors((e) => omit(e, field) as typeof e);
      return;
    }

    setErrors(() => ({}));
  };

  const checkValidity = (field?: T) => {
    if (field) {
      resetErrors(field);
      let validity = true;
      Object.entries(mapping).forEach(([key, m]) => {
        if (m.field === field && m.onCheckValidity && !m.onCheckValidity()) {
          add(key);
          validity = false;
        }
      });
      return validity;
    }
    resetErrors();
    let validity = true;
    Object.entries(mapping).forEach(([key, m]) => {
      if (m.onCheckValidity && !m.onCheckValidity()) {
        add(key);
        validity = false;
      }
    });
    return validity;
  };

  return [errors, checkValidity, add, resetErrors] as const;
}
