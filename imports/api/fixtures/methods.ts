import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { ServerMethod } from "/imports/utils/ServerMethod";

import { Groups } from "../groups/groups";
import { Events } from "/imports/api/events/events";
import { Organizations } from "../organizations/organizations";
import { Regions } from "/imports/api/regions/regions";
import { Venues } from "/imports/api/venues/venues";
import { InfoPages } from "../infoPages/infoPages";
import { Tenants } from "../tenants/tenants";
import { GroupDiscussions } from "../group-discussions/group-discussions";

import { create as groupsDataCreate } from "./groups/create";
import { create as eventsDataCreate } from "./events/create";
import { generate as eventsDataGenerate } from "./events/generate";
import { create as organizationsDataCreate } from "./organizations/create";
import { create as regionsDataCreate } from "./regions/create";
import { create as venuesDataCreate } from "./venues/create";
import { generate as commentsDataGenerate } from "./comments/generate";
import { usersCreate as usersDataCreate } from "./usersCreate";
import { serverError } from "../log/methods";
import { Invitations } from "../invitations/invitations";
import { JoinLinks } from "../joinLinks/joinLinks";

export const clean = ServerMethod(
  "fixtures.clean",
  async () => {
    if (!PrivateSettings.testdata) {
      return;
    }
    try {
      await Promise.all([
        GroupDiscussions.removeAsync({}),
        Events.removeAsync({}),
        Groups.removeAsync({}),
        Venues.removeAsync({}),
        Regions.removeAsync({}),
        Invitations.removeAsync({}),
        JoinLinks.removeAsync({}),
        Tenants.removeAsync({}),
        Organizations.removeAsync({}),
        InfoPages.removeAsync({}),
      ]);
    } catch (e) {
      serverError(e);
      throw e;
    }
  },
  { simulation: false },
);

export const create = ServerMethod(
  "fixtures.create",
  async () => {
    if (!PrivateSettings.testdata) {
      return;
    }

    try {
      await usersDataCreate();

      if ((await Organizations.countDocuments()) === 0) {
        await organizationsDataCreate();
      }

      if ((await Regions.countDocuments()) === 0) {
        await regionsDataCreate();
      }

      if ((await Venues.countDocuments()) === 0) {
        await venuesDataCreate();
      }

      if ((await Groups.countDocuments()) === 0) {
        await groupsDataCreate();
      }

      if ((await Events.countDocuments()) === 0) {
        await eventsDataCreate();
        await eventsDataGenerate();
      }

      if ((await GroupDiscussions.countDocuments()) === 0) {
        await commentsDataGenerate();
      }
    } catch (e) {
      serverError(e);
      throw e;
    }
  },
  { simulation: false },
);
