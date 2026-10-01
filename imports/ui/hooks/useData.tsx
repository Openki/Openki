import { useState, useEffect } from "react";

// from https://de.react.dev/learn/you-might-not-need-an-effect#fetching-data
export function useData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (!ignore) {
          setData(json);
        }
      });
    return () => {
      ignore = true;
    };
  }, [url]);
  return data;
}
