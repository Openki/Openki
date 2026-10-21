import { Log } from "../../log/log";
import { RegionEntity, Regions } from "../../regions/regions";
import { ensure } from "../ensureFixture";
import { Prng } from "../Prng";
import { regions } from "./data";

export async function create() {
  const prng = Prng("createRegions");
  for (const template of regions) {
    const region = {
      ...template,
      tenant: template.tenant
        ? await ensure.tenant(
            template.tenant,
            template.admin ? (await ensure.user(template.admin))._id : undefined,
          )
        : prng() > 0.3
          ? await ensure.tenant("Hmmm")
          : await ensure.tenant("Kopf", (await ensure.user("Kopf"))._id),
      defaultTeamOrganizations: template.defaultTeamOrganizations,
    } as unknown as RegionEntity;
    if (template.loc) {
      const coordinates = template.loc.toReversed() as [long: number, lat: number]; // GeoJSON takes latitude first
      region.loc = { type: "Point", coordinates };
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
    await Regions.insertAsync(region);
  }

  Log.record("testdata", ["Regions"], { message: `Inserted ${regions.length} region fixtures.` });
}
