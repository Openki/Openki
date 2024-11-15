/* eslint-disable no-await-in-loop */
import { RegionEntity, Regions } from "../../regions/regions";
import { ensure } from "../ensureFixture";
import { Prng } from "../Prng";
import { regions } from "./data";

export async function create() {
  const userKopf = (await ensure.user("Kopf", undefined, true))._id;

  const prng = Prng("createRegions");
  for (const r of regions) {
    const region = {
      ...r,
      tenant: prng() > 0.3 ? await ensure.tenant("Hmmm") : await ensure.tenant("Kopf", userKopf),
    } as unknown as RegionEntity; // clone
    if (r.loc) {
      const coordinates = r.loc.reverse(); // GeoJSON takes latitude first
      region.loc = { type: "Point", coordinates: coordinates as [long: number, lat: number] };
    }
    await Regions.insertAsync(region);
  }

  return `Inserted ${regions.length} region fixtures.`;
}
