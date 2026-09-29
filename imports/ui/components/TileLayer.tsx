import React, { JSX } from "react";
import { TileLayer } from "react-leaflet";

export const TileLayers: Record<string, JSX.Element> = {
  de: (
    <TileLayer
      url="https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png"
      attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
      noWrap
    />
  ),
  "de-ZH": (
    <TileLayer
      url="https://{s}.tile.osm.ch/name-gsw/{z}/{x}/{y}.png"
      attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
      noWrap
    />
  ),
  fr: (
    <TileLayer
      url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
      attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
      noWrap
    />
  ),
  default: (
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
      noWrap
    />
  ),
};
