import { _ } from "meteor/underscore";
import { i18n } from "/imports/startup/both/i18next";
import { Session } from "meteor/session";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import "./styles.scss";

export interface LocEntity {
  type: "Point";
  coordinates: [number, number];
}

export interface MarkerEntity {
  _id: string;
  loc: LocEntity;
  content?: string;
}

const FaIcon = function (faClass: string) {
  return function () {
    return L.DomUtil.create("span", faClass);
  };
};

const IconControl: new (options: {
  icon: () => HTMLElement;
  class?: string;
  title: string;
  position?: string;
  onClick?: () => void;
  onMouseDown?: () => void;
}) => L.Control = L.Control.extend({
  options: {
    icon: null,
    class: "",
    title: "",
    position: "topright",
  },

  initialize(options: any) {
    L.Util.setOptions(this, options);
  },

  onAdd() {
    const elem = this.options.icon() as HTMLElement;
    if (this.options.class) {
      L.DomUtil.addClass(elem, this.options.class);
    }
    elem.setAttribute("title", this.options.title);
    if (this.options.onClick) {
      elem.addEventListener("click", this.options.onClick);
    }
    if (this.options.onMouseDown) {
      elem.addEventListener("mousedown", this.options.onMouseDown);
    }
    return elem;
  },
});

export function Map(props: { maxZoom?: number; markers: MarkerEntity[] }) {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState(false);
  const [cancelNextFitBounds, setCancelNextFitBounds] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Depending on view state, different controls are shown
  const zoomControl = L.control.zoom({
    zoomInTitle: t("map.zoomInTitle", "Zoom in") as string,
    zoomOutTitle: t("map.zoomOutTitle", "Zoom out") as string,
  });
  const attributionControl = L.control.attribution();
  const scaleControl = L.control.scale({
    imperial: Session.equals("locale", "en"),
  });
  const fullscreenControl = new IconControl({
    icon: FaIcon("fa-solid fa-maximize"),
    title: t("map.fullscreen", "big map"),
    onClick: () => {
      setFullscreen(true);
    },
  });
  const closeFullscreenControl = new IconControl({
    icon: FaIcon("fa-solid fa-xmark"),
    class: "fa-2x",
    title: i18n("map.fullscreenClose", "close"),
    onClick: () => {
      setFullscreen(false);
    },
  });

  // ---
  const layers: { [id: string]: L.GeoJSON<any> } = {};

  const options = {
    zoomControl: false,
    attributionControl: false,
    dragging: !L.Browser.mobile,
  };

  const mainIcon = L.divIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
  });

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }
    const map = L.map(elementRef.current, options).setView(L.latLng(0, 0), 1);

    // Zoom to show all markers
    // This is debounc'd so it's only done after the last marker in a series is added
    const fitBounds = _.debounce(() => {
      if (cancelNextFitBounds) {
        setCancelNextFitBounds(false);
        return;
      }

      const bounds = L.latLngBounds([]);
      Object.values(layers).forEach((layer) => {
        bounds.extend(layer.getBounds());
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }, 100);

    const maxZoom = props.maxZoom || 19;

    L.Icon.Default.imagePath = "packages/bevanhunt_leaflet/images";

    // Add tiles depending on language
    let tiles: L.TileLayer | undefined;
    const tileLayers: { [lang: string]: () => L.TileLayer } = {
      de() {
        return L.tileLayer("//{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", {
          maxZoom,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        });
      },
      "de-ZH"() {
        return L.tileLayer("//{s}.tile.osm.ch/name-gsw/{z}/{x}/{y}.png", {
          maxZoom,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        });
      },
      fr() {
        return L.tileLayer("//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
          maxZoom,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        });
      },
      default() {
        return L.tileLayer("//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        });
      },
    };

    // ---

    if (tiles) {
      map.removeLayer(tiles);
    }
    let tileF = tileLayers[Session.get("locale")];
    if (!tileF) {
      tileF = tileLayers.default;
    }
    tiles = tileF();
    if (map) {
      tiles.addTo(map);
    }
    // ---

    const show = function (control: { shown?: boolean } & L.Control, toggle: boolean) {
      if (control.shown === undefined) {
        /* eslint-disable-next-line no-param-reassign */
        control.shown = false;
      }

      if (control.shown !== toggle) {
        /* eslint-disable-next-line no-param-reassign */
        control.shown = toggle;
        if (toggle) {
          map.addControl(control);
        } else {
          map.removeControl(control);
        }
      } else if (control.shown) {
        map.removeControl(control);
        map.addControl(control);
      }
    };

    show(attributionControl, true);
    show(zoomControl, true);
    show(scaleControl, fullscreen);
    show(fullscreenControl, !fullscreen);
    show(closeFullscreenControl, fullscreen);

    // ---

    const { markers } = props;

    markers.forEach((mark) => {
      const marker = L.geoJSON(mark.loc, {
        pointToLayer(_feature, latlng) {
          const m = L.marker(latlng, {
            icon: mainIcon,
          });

          if (mark.content) {
            m.bindPopup(mark.content).openPopup();
          }

          return m;
        },
      });
      layers[mark._id] = marker;
      if (map) {
        marker.addTo(map);
      }
    });

    //await MeteorAsync.defer();

    fitBounds();

    // ---

    //await MeteorAsync.defer();

    if (fullscreen) {
      const elements = elementRef.current?.querySelectorAll(".map-box, .map-fullscreen");
      elements?.forEach((element) => {
        element.setAttribute("style", "position: fixed");
      });
      map.dragging.enable();
    } else {
      const elements = elementRef.current?.querySelectorAll(".map-box, .map-fullscreen");
      elements?.forEach((element) => {
        element.setAttribute("style", "");
      });
      if (!L.Browser.mobile) {
        map.dragging.enable();
      } else {
        map.dragging.disable();
      }
    }

    // await MeteorAsync.defer();

    map.invalidateSize();

    fitBounds();
  });

  return (
    <div className={fullscreen ? "map-fullscreen" : "map-box"}>
      <div className="map" ref={elementRef}></div>
    </div>
  );
}

// template.events({
//   keyup(event, instance) {
//     // Press escape to close fullscreen
//     if ((event as any).keyCode === 27) {
//       instance.fullscreen.set(false);
//     }
//   },
// });

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("Map2", () => Map);
