import React from "react";
import { TileLayer } from "react-leaflet";

export const TileLayers: { [lang: string]: React.JSX.Element } = {
  de: (
    <TileLayer
      url={"//{s}.tile.openstreetmap.de/{z}/{x}/{y}.png"}
      attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    />
  ),
  "de-ZH": (
    <TileLayer
      url={"//{s}.tile.osm.ch/name-gsw/{z}/{x}/{y}.png"}
      attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    />
  ),
  fr: (
    <TileLayer
      url={"//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"}
      attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    />
  ),
  default: (
    <TileLayer
      url={"//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
      attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
    />
  ),
};
