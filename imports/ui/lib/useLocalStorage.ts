import { useEffect, useState } from "react";

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
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value, initialValue]);

  function reset() {
    setValue(initialValue);
    localStorage.removeItem(key);
  }

  return [value, setValue, reset] as const;
}
