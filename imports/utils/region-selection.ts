import { Accounts } from "meteor/accounts-base";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";

import * as Regions from "/imports/api/regions/publications";
import * as usersMethods from "/imports/api/users/methods";
import { RegionModel } from "/imports/api/regions/regions";

import * as UserLocation from "/imports/utils/user-location";
import { getQueryParam } from "/imports/utils/url-tools";

/**
 * List of routes that show different results when the region changes.
 */
export const regionDependentRoutes = [
  "home",
  "search",
  "calendar",
  "venuesMap",
  "eventsMap",
  "organizationDetails",
];

function persistRegion(region: string) {
  try {
    localStorage.setItem("region", region); // to survive page reload
  } catch {
    // ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
  }
  Session.set("region", region);
}

function useAsRegion(regions: RegionModel[], regionIdOrName: string) {
  if (!regionIdOrName) {
    return false;
  }

  // Special case 'all'
  if (regionIdOrName === "all") {
    persistRegion(regionIdOrName);
    return true;
  }

  // Normal case region ID
  if (regions.some((r) => r._id === regionIdOrName)) {
    persistRegion(regionIdOrName);
    return true;
  }

  // Special case by name so you can do ?region=Spilistan
  const region = regions.find((r) => r.name === regionIdOrName);
  if (region) {
    persistRegion(region._id);
    return true;
  }

  // Ignore invalid region ID
  return false;
}

export async function subscribe() {
  const findFilter = Regions.findFilter.subscribe(async () => {
    const selectors = [
      Session.get("region"),
      getQueryParam("region"),
      localStorage?.getItem("region"),
    ].filter(Boolean) as string[];

    const regions = await (await findFilter()).fetchAsync();

    // If any of these regions are usable we stop here
    if (selectors.some((s) => useAsRegion(regions, s))) {
      return;
    }

    if (regions.length === 1 && useAsRegion(regions, regions[0]._id)) {
      // there is only one region on this instance or visible for this user
      return;
    }

    // If no region has been selected previously, we show the splash-screen.

    let region;
    try {
      // Ask geolocation server to place us so the splash-screen has our best
      // guess selected.
      region = await UserLocation.detect();
    } catch (err) {
      console.error(`Region autodetection error: ${err}`);
    }

    if (region) {
      useAsRegion(regions, region._id);
    } else {
      // Give up
      useAsRegion(regions, "all");
    }

    // Have the user confirm the automatically detected region by displaying the splash-screen.
    Session.set("showRegionSplash", true);
  });
}

/**
 * Subscribe to list of regions and configure the regions
 * This checks client storage for a region setting. When there is no previously
 * selected region, we ask the server to do geolocation. If that fails too,
 * we just set the region to 'all regions'.
 */
export function init() {
  // We assume the initial onLogin() callback comes before the regions' ready.
  // We have no guarantee for this however!
  Accounts.onLogin(async () => {
    const user = await Meteor.userAsync();
    if (user) {
      const { regionId } = user.profile;
      if (regionId) {
        persistRegion(regionId);
      }
    }
  });

  subscribe();
}

export async function change(regionId: string) {
  persistRegion(regionId);
  if (regionId !== "all" && Meteor.userId()) {
    await usersMethods.regionChange(regionId);
  }
}
