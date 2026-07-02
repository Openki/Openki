import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMap } from "react-leaflet";

import FullScreen from "leaflet.fullscreen";
import "leaflet.fullscreen/dist/Control.FullScreen.css";

export function FullscreenControl() {
  const map = useMap();
  const { t } = useTranslation();

  useEffect(() => {
    const fullscreenControl = new FullScreen({
      position: "topleft",
      title: t("fullscreen.show", "Full screen"),
      titleCancel: t("fullscreen.exit", "Exit full screen"),
      forcePseudoFullscreen: true,
      content: '<i class="fa-solid fa-expand" style="font-size: 18px;vertical-align: middle;" />',
    });

    const handleEnterFullscreen = function () {
      (map as any).fullscreenControl.link.innerHTML =
        '<i class="fa-solid fa-compress" style="font-size: 18px;vertical-align: middle;" />';
    };
    map.on("enterFullscreen", handleEnterFullscreen);

    const handleExitFullscreen = function () {
      (map as any).fullscreenControl.link.innerHTML =
        '<i class="fa-solid fa-expand" style="font-size: 18px;vertical-align: middle;" />';
    };
    map.on("exitFullscreen", handleExitFullscreen);

    fullscreenControl.addTo(map);

    return () => {
      (map as any).fullscreenControl.link.remove();
      map.off("enterFullscreen", handleEnterFullscreen);
      map.off("exitFullscreen", handleExitFullscreen);
    };
  }, [map]);

  return null;
}
