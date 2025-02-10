/* eslint-disable no-await-in-loop */
import { clone } from "lodash";
import { Log } from "../../log/log";
import { Geodata, RegionEntity, Regions } from "../../regions/regions";
import { ensure } from "../ensureFixture";
import { Prng } from "../Prng";
import { regions } from "./data";

export async function create() {
  const userKopf = (await ensure.user("Kopf", undefined, true))._id;

  const prng = Prng("createRegions");
  for (const template of regions) {
    const region = {
      ...template,
      // eslint-disable-next-line no-nested-ternary
      tenant: template.tenant
        ? await ensure.tenant(template.tenant)
        : prng() > 0.3
        ? await ensure.tenant("Hmmm")
        : await ensure.tenant("Kopf", userKopf),
    } as unknown as RegionEntity;
    if (template.loc) {
      const coordinates = clone(template.loc).reverse(); // GeoJSON takes latitude first
      region.loc = { type: "Point", coordinates } as Geodata;
    }
    if (template.calendarStartDate) {
      const startDate = new Date();
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      // simulate that we start two days after begining
      startDate.setDate(startDate.getDate() - 2);
      region.calendarStartDate = startDate;
    }
    if (template.defaultTeamGroups) {
      region.defaultTeamGroups = await Promise.all(
        template.defaultTeamGroups.map((g) => ensure.group(g)),
      );
    }
    await Regions.insertAsync(region);
  }

  Log.record("testdata", ["Regions"], { message: `Inserted ${regions.length} region fixtures.` });
}
