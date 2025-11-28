import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMap } from "react-leaflet";

import "leaflet.fullscreen";
import "leaflet.fullscreen/Control.FullScreen.css";

export function FullscreenControl() {
  const map = useMap();
  const { t } = useTranslation();

  useEffect(() => {
    const fullscreenControl = L.control.fullscreen({
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
  });

  return null;
}
