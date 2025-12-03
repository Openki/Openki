import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function Events(props: {
  onFocus?: (() => void) | undefined;
  onBlur?: (() => void) | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    const mapContainer = map.getContainer();

    const handleFocus = () => {
      props.onFocus?.();
    };
    const handleBlur = () => {
      props.onBlur?.();
    };
    mapContainer.addEventListener("focus", handleFocus);
    mapContainer.addEventListener("blur", handleBlur);
    return () => {
      mapContainer.removeEventListener("focus", handleFocus);
      mapContainer.removeEventListener("blur", handleBlur);
    };
  });

  return null;
}
