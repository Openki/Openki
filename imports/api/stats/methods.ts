import { check } from "meteor/check";

import { getRegionStats, Stats } from "/imports/api/stats/stats";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { getUserAsync } from "../users/users";

export const region = ServerMethod("stats.region", async (regionId: string) => {
  check(regionId, String);

  const user = await getUserAsync();
  if (!user?.hasPrivilege("admin")) {
    return {} as Stats;
  }

  const regionFilter = regionId === "all" ? "" : regionId;
  return getRegionStats(regionFilter);
});
