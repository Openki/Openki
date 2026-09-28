import { isEqual } from "lodash-es";
import { useEffect, useState } from "react";

/**
 * Like `useState()` but persisted to `localStorage` if it's available.
 * Falls back to work like a regular `useState` if the web storage fails.
 *
 * NOTE: values must be serializable and parsable by `JSON.stringify` / `JSON.parse`
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (Meteor.isClient) {
      try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
      } catch (error) {
        console.error(error);
      }
    }

    return initialValue;
  });

  useEffect(() => {
    if (Meteor.isClient) {
      // Clear default values to only keep state the user has modified.
      if (isEqual(value, initialValue)) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  }, [key, value, initialValue]);

  function reset() {
    setValue(initialValue);
    if (Meteor.isClient) {
      localStorage.removeItem(key);
    }
  }

  return [value, setValue, reset] as const;
}
