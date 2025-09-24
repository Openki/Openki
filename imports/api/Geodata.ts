import { StringEnum, Tuple } from "/imports/utils/CustomChecks";

export const GeodataPattern = {
  type: StringEnum("Point"),
  /** (not lat-long !) */
  coordinates: Tuple<[long: NumberConstructor, lat: NumberConstructor]>(Number, Number),
};

export interface Geodata {
  type: "Point";
  coordinates: [long: number, lat: number];
}
