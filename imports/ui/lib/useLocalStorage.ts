import { isEqual } from "lodash-es";
import { useEffect, useState } from "react";

/**
 * Check if a web storage of a specific type is enabled.
 *
 * Source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#feature-detecting_localstorage
 */
function isStorageAvailable(type: "localStorage" | "sessionStorage") {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === "QuotaExceededError" &&
      // Acknowledge `QuotaExceededError` only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

/**
 * Like `useState()` but persisted to `localStorage` if it's available.
 * Falls back to work like a regular `useState` if the web storage fails.
 *
 * NOTE: values must be serializable and parsable by `JSON.stringify` / `JSON.parse`
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const canPersist = Meteor.isClient && isStorageAvailable("localStorage");

  const [value, setValue] = useState<T>(() => {
    if (canPersist) {
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
    if (canPersist) {
      // Clear default values to only keep state the user has modified.
      if (isEqual(value, initialValue)) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  }, [key, value, initialValue, canPersist]);

  function reset() {
    setValue(initialValue);
    if (canPersist) {
      localStorage.removeItem(key);
    }
  }

  return [value, setValue, reset] as const;
}
