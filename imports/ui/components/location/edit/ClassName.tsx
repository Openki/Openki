import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

export function ClassName({ value }: { value?: string | undefined }) {
  const map = useMap();
  const classList = value?.split(" ").filter((v) => v) || [];
  const [currentClassList, setCurrentClassList] = useState(classList);

  useEffect(() => {
    map.getContainer().classList.remove(...currentClassList);
    map.getContainer().classList.add(...classList);
    setCurrentClassList(classList);
  }, [classList.join(" ")]);

  return null;
}
