import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMap } from "react-leaflet";

import FullScreen from "leaflet.fullscreen";
import "leaflet.fullscreen/dist/Control.FullScreen.css";
import { type Map } from "leaflet";

export function FullscreenControl() {
  const map = useMap() as Map & { fullscreenControl: FullScreen & { link: HTMLDivElement } };
  const { t } = useTranslation();

  useEffect(() => {
    const fullscreenControl = new FullScreen({
      position: "topleft",
      title: t("fullscreen.show", "Full screen"),
      titleCancel: t("fullscreen.exit", "Exit full screen"),
      forcePseudoFullscreen: true,
      content: '<i class="fa-solid fa-expand" style="font-size: 18px;vertical-align: middle;" />',
    });

    function handleEnterFullscreen() {
      map.fullscreenControl.link.innerHTML =
        '<i class="fa-solid fa-compress" style="font-size: 18px;vertical-align: middle;" />';
    }
    map.on("enterFullscreen", handleEnterFullscreen);

    function handleExitFullscreen() {
      map.fullscreenControl.link.innerHTML =
        '<i class="fa-solid fa-expand" style="font-size: 18px;vertical-align: middle;" />';
    }
    map.on("exitFullscreen", handleExitFullscreen);

    fullscreenControl.addTo(map);

    return () => {
      map.fullscreenControl.link.remove();
      map.off("enterFullscreen", handleEnterFullscreen);
      map.off("exitFullscreen", handleExitFullscreen);
    };
  }, [map, t]);

  return null;
}
