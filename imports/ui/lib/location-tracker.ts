import { Mongo } from "meteor/mongo";
import { Regions } from "/imports/api/regions/regions";
import { Geodata } from "/imports/api/Geodata";

export interface PresetMarkerEntity {
  preset: true;

  presetName: string;
  presetAddress: string;
  editor: string;
}

export type ProposedMarkerEntity = {
  proposed: true;

  _id: string;
  loc: Geodata;

  presetAddress: string;
  name: string;
} & PresetMarkerEntity;

export interface SelectedMarkerEntity {
  selected: true;
}

export interface MainMarkerEntity {
  main: true;

  _id: string;
  loc: Geodata;
  draggable?: boolean;
}

export interface CenteredMarkerEntity {
  /** Marks that have the center flage set are not displayed but used for anchoring the map */
  center: true;

  _id: string;
  loc: Geodata;
}

export interface RemoveMarkerEntity {
  remove: true;

  _id: string;
  loc: Geodata;
}

export type MarkerEntity = {
  _id: string;
  hover?: boolean;
} & (
  | MainMarkerEntity
  | CenteredMarkerEntity
  | RemoveMarkerEntity
  | ProposedMarkerEntity
  | PresetMarkerEntity
);

export class LocationTracker {
  /** Local collection for in-memory storage */
  public markers = new Mongo.Collection<MarkerEntity>(null);

  setLocation(location: { loc?: Geodata } | undefined, draggable = false, soft = false) {
    if (soft) {
      const marker = this.markers.findOne({ main: true }) as MainMarkerEntity;
      if (marker && location?.loc) {
        this.markers.update({ _id: marker._id }, { $set: { loc: location.loc, draggable } });
        return;
      }
    }
    this.markers.remove({ main: true });
    if (location?.loc) {
      this.markers.insert({
        loc: location.loc,
        main: true,
        draggable,
      });
    }
  }

  getLocation() {
    return (this.markers.findOne({ main: true }) as MainMarkerEntity)?.loc;
  }

  clearRegion() {
    this.markers.remove({ center: true });
  }

  setRegion(regionId: string) {
    const region = Regions.findOne(regionId);

    if (!region?.loc) {
      return;
    }

    this.markers.insert({
      loc: region.loc,
      center: true,
    });
  }
}
