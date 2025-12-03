import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";

export function Props(props: Record<string, string | undefined>) {
  const map = useMap();

  const [currentProps, setCurrentProps] = useState(props);

  useEffect(() => {
    Object.keys(currentProps).forEach((name) => {
      map.getContainer().removeAttribute(name);
    });
    Object.entries(props).forEach((prop) => {
      map.getContainer().setAttribute(prop[0], prop[1] || "");
    });

    setCurrentProps(props);
  }, [JSON.stringify(props)]);

  return null;
}
