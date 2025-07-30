import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMap } from "react-leaflet";

import "leaflet.fullscreen";
import "leaflet.fullscreen/Control.FullScreen.css";

export function FullscreenControl() {
  const map = useMap();
  const { t } = useTranslation();

  const fullscreenControl = L.control.fullscreen({
    position: "topleft",
    title: t("fullscreen.show", "Full screen"),
    titleCancel: t("fullscreen.exit", "Exit full screen"),
    forcePseudoFullscreen: true,
    content: '<i class="fa-solid fa-expand" style="font-size: 18px;vertical-align: middle;"></i>',
  });

  map.on("enterFullscreen", function () {
    (fullscreenControl as any).link.innerHTML =
      '<i class="fa-solid fa-compress" style="font-size: 18px;vertical-align: middle;"></i>';
  });

  map.on("exitFullscreen", function () {
    (fullscreenControl as any).link.innerHTML =
      '<i class="fa-solid fa-expand" style="font-size: 18px;vertical-align: middle;"></i>';
  });

  useEffect(() => {
    fullscreenControl.addTo(map);

    return () => {
      fullscreenControl.remove();
    };
  });

  return null;
}
