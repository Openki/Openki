import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";

import { getRegionStats, Stats } from "/imports/api/stats/stats";
import { ServerMethod } from "/imports/utils/ServerMethod";

export const region = ServerMethod("stats.region", async (regionId: string) => {
  check(regionId, String);

  const user = await Meteor.userAsync();
  if (!user?.hasPrivilege("admin")) {
    return {} as Stats;
  }

  const regionFilter = regionId === "all" ? "" : regionId;
  return getRegionStats(regionFilter);
});
