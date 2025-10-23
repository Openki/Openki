import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { observeSize } from "/imports/ui/lib/observeHeight";

export function AutoInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    const observer = observeSize(map.getContainer(), () => {
      map.invalidateSize();
    });

    return () => {
      observer.stop();
    };
  });

  return null;
}
