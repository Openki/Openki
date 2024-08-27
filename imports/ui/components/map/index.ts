import { Mongo } from "meteor/mongo";
import { ReactiveVar } from "meteor/reactive-var";
import { _ } from "meteor/underscore";
import { i18n } from "/imports/startup/both/i18next";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Session } from "meteor/session";

import { MeteorAsync } from "/imports/utils/promisify";

import "./template.html";
import "./styles.scss";

export interface LocEntity {
  type: "Point";
  coordinates: [number, number];
}

export interface MarkerEntity {
  _id: string;
  main?: boolean;
  center?: boolean;
  proposed?: boolean;
  draggable?: boolean;
  hover?: boolean;
  selected?: boolean;
  loc: LocEntity;
}

/**
 * Display markers on an interactive map
 */
const Template = TemplateAny as TemplateStaticTyped<
  "map",
  {
    maxZoom?: number;
    markers: Mongo.Collection<MarkerEntity>;
    allowPlacing?: () => boolean;
    allowRemoving?: () => boolean;
  },
  {
    cancelNextFitBounds: boolean;
    fullscreen: ReactiveVar<boolean>;
    proposeMarker: () => void;
    removeMarker: () => void;
  }
>;

const template = Template.map;

template.onCreated(function () {
  this.fullscreen = new ReactiveVar(false);
});

const FaIcon = function (faClass: string) {
  return function () {
    return L.DomUtil.create("span", faClass);
  };
};

const FaCompIcon = function (opClass: string, icClass: string) {
  return function () {
    const cont = L.DomUtil.create("span", "fa");
    L.DomUtil.create("i", opClass, cont);

    const ic = L.DomUtil.create("i", `${icClass} fa-lg`, cont);
    ic.style.position = "absolute";
    ic.style.left = "0.7ex";
    ic.style.top = "0.7ex";
    L.DomUtil.setOpacity(ic, 0.5);

    return cont;
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

template.onRendered(function () {
  const instance = this;
  const maxZoom = instance.data.maxZoom || 19;

  const layers: { [id: string]: L.GeoJSON<any> } = {};
  const centers: { [id: string]: L.LatLngBounds } = {};

  L.Icon.Default.imagePath = "packages/bevanhunt_leaflet/images";

  const options = {
    zoomControl: false,
    attributionControl: false,
    dragging: !L.Browser.mobile,
  };

  const map = L.map(instance.find(".map"), options).setView(L.latLng(0, 0), 1);

  // Add tiles depending on language
  let tiles: L.TileLayer;
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
    "sv"() {
      return L.tileLayer("//{s}.tiles.hack-mas24.c3nav.de/88/{z}/{x}/{y}/0.png", {
        maxZoom,
        attribution: '&copy; <a href="https://github.com/c3nav">c3nav</a>',
      });
    },
    "tr"() {
      return L.tileLayer("https://tiles.hack-mas24.c3nav.de/88/{z}/{x}/{y}/0.png", {
        maxZoom,
        attribution: '&copy; <a href="https://github.com/c3nav">c3nav</a>',
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

  instance.autorun(() => {
    if (tiles) {
      map.removeLayer(tiles);
    }
    let tileF = tileLayers[Session.get("locale")];
    if (!tileF) {
      tileF = tileLayers.default;
    }
    tiles = tileF();
    tiles.addTo(map);
  });

  // Depending on view state, different controls are shown
  const zoomControl = L.control.zoom({
    zoomInTitle: i18n("map.zoomInTitle", "Zoom in") ?? "",
    zoomOutTitle: i18n("map.zoomOutTitle", "Zoom out") ?? "",
  });
  const attributionControl = L.control.attribution();
  const scaleControl = L.control.scale({
    imperial: Session.equals("locale", "en"),
  });
  const fullscreenControl = new IconControl({
    icon: FaIcon("fa-solid fa-maximize"),
    title: i18n("map.fullscreen", "big map"),
    onClick: () => {
      instance.fullscreen.set(true);
    },
  });
  const closeFullscreenControl = new IconControl({
    icon: FaIcon("fa-solid fa-xmark"),
    class: "fa-2x",
    title: i18n("map.fullscreenClose", "close"),
    onClick: () => {
      instance.fullscreen.set(false);
    },
  });
  const addMarkerControl = new IconControl({
    icon: FaCompIcon("fa-solid fa-plus", "fa-solid fa-location-dot"),
    class: "comp-icon",
    title: i18n("map.addMarker", "Set marker"),
    position: "bottomright",
    onMouseDown: () => {
      // eslint-disable-next-line no-param-reassign
      instance.cancelNextFitBounds = true;
      instance.proposeMarker();
    },
  });
  const removeMarkerControl = new IconControl({
    icon: FaCompIcon("fa-solid fa-minus", "fa-solid fa-location-dot"),
    class: "comp-icon",
    title: i18n("map.removeMarker", "Remove marker"),
    position: "bottomright",
    onClick: () => {
      instance.removeMarker();
    },
  });

  instance.autorun(() => {
    const fullscreen = instance.fullscreen.get();

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

    // This is actually a function we can call to establish a reactive
    // dependeny into the other instance.
    const { allowPlacing } = instance.data;
    show(addMarkerControl, !!allowPlacing && allowPlacing());

    const { allowRemoving } = instance.data;
    show(removeMarkerControl, !!allowRemoving && allowRemoving());
  });

  const geojsonProposedMarkerOptions = {
    radius: 8,
    fillColor: "#12f",
    color: "#222",
    weight: 1,
    opacity: 0.9,
    fillOpacity: 0.4,
  };

  // Zoom to show all markers
  // This is debounc'd so it's only done after the last marker in a series is added
  const fitBounds = _.debounce(() => {
    if (instance.cancelNextFitBounds) {
      instance.cancelNextFitBounds = false;
      return;
    }

    const bounds = L.latLngBounds([]);
    let count = 0;
    Object.values(layers).forEach((layer) => {
      bounds.extend(layer.getBounds());
      count += 1;
    });

    let zoom = maxZoom - 3; // Zoom out a little to give the user a better overview.

    // Use center markers when there are no other markers
    if (count < 1) {
      Object.values(centers).forEach((center) => {
        bounds.extend(center);
        count += 1;
      });
      if (count === 1) {
        zoom = maxZoom - 6;
      }
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: zoom });
    }
  }, 100);

  fitBounds();

  const mainIcon = L.divIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
  });

  // Tracked so that observe() will be stopped when the template is destroyed
  instance.autorun(() => {
    const { markers } = instance.data;

    const addMarker = function (mark: MarkerEntity) {
      // Marks that have the center flage set are not displayed but used for anchoring the map
      if (mark.center) {
        centers[mark._id] = L.geoJSON(mark.loc).getBounds();
      } else {
        const marker = L.geoJSON(mark.loc, {
          pointToLayer(_feature, latlng) {
            let m;
            if (mark.proposed) {
              m = L.circleMarker(latlng, geojsonProposedMarkerOptions);
            } else {
              m = L.marker(latlng, {
                icon: mainIcon,
                draggable: mark.draggable ?? false,
              });
            }
            // When the marker is clicked, mark it as 'selected' in the collection,
            // and deselect all others.
            m.on("click", () => {
              markers.update({}, { $set: { selected: false } });
              markers.update(mark._id, { $set: { selected: true } });
            });
            m.on("dragend", (event) => {
              const latLng = event.target.getLatLng() as { lng: number; lat: number };
              const loc = {
                type: "Point" as const,
                coordinates: [latLng.lng, latLng.lat] as [number, number],
              };
              map.panTo(latLng);
              markers.update(mark._id, { $set: { loc } });
            });
            m.on("mouseover", () => {
              markers.update({}, { $set: { hover: false } }, { multi: true });
              markers.update(mark._id, { $set: { hover: true } });
            });
            m.on("mouseout", () => {
              markers.update({}, { $set: { hover: false } }, { multi: true });
            });
            return m;
          },
        });
        layers[mark._id] = marker;
        marker.addTo(map);
      }
    };

    const removeMarker = function (mark: MarkerEntity) {
      if (layers[mark._id]) {
        map.removeLayer(layers[mark._id]);
      }
      delete layers[mark._id];
      delete centers[mark._id];
    };

    const updateMarker = function (mark: MarkerEntity) {
      const layer = layers[mark._id];
      if (!layer) {
        return;
      }
      layer.setStyle({ weight: mark.hover ? 5 : 1 });
    };

    markers.find().observe({
      added(mark) {
        addMarker(mark);
        fitBounds();
      },

      changed(mark) {
        updateMarker(mark);
      },

      removed(mark) {
        removeMarker(mark);
        fitBounds();
      },
    });
  });

  instance.autorun(async () => {
    const fullscreen = instance.fullscreen.get();

    await MeteorAsync.defer();

    if (fullscreen) {
      instance.find(".map-box,.map-fullscreen").setAttribute("style", "position: fixed"); // Fix for iOS
      map.dragging.enable();
    } else {
      instance.find(".map-box,.map-fullscreen").setAttribute("style", "");
      if (!L.Browser.mobile) {
        map.dragging.enable();
      } else {
        map.dragging.disable();
      }
    }

    await MeteorAsync.defer();

    map.invalidateSize();
    fitBounds();
  });

  instance.proposeMarker = function () {
    const center = map.getCenter();
    instance.data.markers.insert({
      proposed: true,
      selected: true,
      loc: { type: "Point", coordinates: [center.lng, center.lat] },
    });
  };

  instance.removeMarker = function () {
    instance.data.markers.update({ main: true }, { $set: { remove: true } });
  };
});

template.helpers({
  mapContainerClass() {
    if (Template.instance().fullscreen.get()) {
      return "map-fullscreen";
    }
    return "map-box";
  },
});

template.events({
  keyup(event, instance) {
    // Press escape to close fullscreen
    if ((event as any).keyCode === 27) {
      instance.fullscreen.set(false);
    }
  },
});
