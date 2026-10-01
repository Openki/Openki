import { omit } from "lodash-es";
import { ReactNode, useEffect, useState } from "react";

export type Mapping<T extends string> = Record<
  string,
  {
    field: T;
    isValid?: () => boolean;
    text: () => ReactNode;
  }
>;

export function useValidation<T extends string>(
  mapping: Mapping<T>,
  options?: {
    initialCheck?: boolean | undefined;
    /** after every change, check errors are fixed */
    autoCheckFixed?: boolean | undefined;
  },
) {
  const initialState: Partial<Record<T, ReactNode>> = {};

  if (options?.initialCheck) {
    Object.values(mapping)
      .filter((m) => m.isValid && !m.isValid())
      .forEach((m) => {
        initialState[m.field] = m.text();
      });
  }
  const add = (key: string) => {
    const m = mapping[key];
    if (!m) {
      // unknown error, you should handle it differently
      return false;
    }

    const field = m.field;
    setErrors((e) => {
      const value = m.text() || key;
      if (e[field] === value) {
        // Only update when necessary to avoid too many e.g. `useEffect` calls.
        // The check do not work if the values are `JSX.Element`
        return e;
      }
      return {
        ...e,
        [field]: m.text() || key,
      };
    });

    return true;
  };

  const resetErrors = (field?: T) => {
    if (field) {
      setErrors((e) => {
        if (!e[field]) {
          // Only update when necessary to avoid too many e.g. `useEffect` calls.
          return e;
        }
        return omit(e, field) as typeof e;
      });
      return;
    }

    setErrors(() => ({}));
  };

  const checkValidity = (field?: T) => {
    if (field) {
      let validity = true;
      Object.entries(mapping).forEach(([key, m]) => {
        if (m.field === field && m.isValid && !m.isValid()) {
          add(key);
          validity = false;
        }
      });
      if (validity) {
        resetErrors(field);
      }
      return validity;
    }
    resetErrors();
    let validity = true;
    Object.entries(mapping).forEach(([key, m]) => {
      if (m.isValid && !m.isValid()) {
        add(key);
        validity = false;
      }
    });
    return validity;
  };

  const [errors, setErrors] = useState(initialState);

  useEffect(() => {
    if (options?.autoCheckFixed) {
      Object.keys(errors).forEach((key) => {
        checkValidity(key as T);
      });
    }
  });

  return [errors, checkValidity, add, resetErrors] as [
    errors: Partial<Record<T, ReactNode>>,
    checkValidity: (field?: T) => boolean,
    addError: (key: string) => boolean,
    resetErrors: (field?: T) => void,
  ];
}
