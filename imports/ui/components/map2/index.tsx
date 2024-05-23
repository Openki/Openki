import React from "react";
import { useSession } from "/imports/utils/react-meteor-data";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { DivIcon, LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import "leaflet/dist/leaflet.css";

import "./styles.scss";

export interface MarkerEntity {
  _id: string;
  loc: LatLngExpression;
  content?: string;
}

const tileLayers: { [lang: string]: () => React.JSX.Element } = {
  de: () => (
    <TileLayer
      url={"//{s}.tile.openstreetmap.de/{z}/{x}/{y}.png"}
      attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    />
  ),
  "de-ZH": () => (
    <TileLayer
      url={"//{s}.tile.osm.ch/name-gsw/{z}/{x}/{y}.png"}
      attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    />
  ),
  fr: () => (
    <TileLayer
      url={"//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"}
      attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    />
  ),
  default: () => (
    <TileLayer
      url={"//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
      attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    />
  ),
};

export function Map(props: { markers: MarkerEntity[] }) {
  const locale = useSession("locale");

  const markerIcon = new DivIcon({
    html: '<span class="fa-solid fa-location-dot" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%)"></span>',
  });

  return (
    <MapContainer bounds={props.markers.map((mark) => mark.loc) as LatLngBoundsExpression}>
      {(tileLayers[locale] || tileLayers.default)()}
      {props.markers.map((mark) => (
        <Marker key={mark._id} position={mark.loc} icon={markerIcon}>
          <Popup>{mark.content}</Popup>
        </Marker>
      ))}
      <FullscreenControl />
    </MapContainer>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("Map2", () => Map);
