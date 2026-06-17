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
import { create as venuesDataCreate } from "./venues/create";
import { generate as commentsDataGenerate } from "./comments/generate";
import { create as regionsDataCreate } from "./regions/create";
import { usersCreate as usersDataCreate } from "./usersCreate";
import { serverError } from "../log/methods";
import { Invitations } from "../invitations/invitations";
import { JoinLinks } from "../joinLinks/joinLinks";
import { updateDbCacheFieldsServerOnly } from "../db-utilities/updateDbCacheFieldsServerOnly";

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

      /**
       * We only need to update the DB cache if the fixture data has changed.
       *
       * NOTE: The user fixtures might change and will currently not cause the DB cache to update.
       * This should be unlikely though, since most of the time, the other DB collections are changing.
       * If you need to enure the fixtures are fully re-created and the DB cache is fully updated,
       * you can reset the DB and thereby re-create all fixtures (including users).
       */
      let shouldUpdateDBCache = false;

      if ((await Organizations.countDocuments()) === 0) {
        await organizationsDataCreate();
        shouldUpdateDBCache = true;
      }

      if ((await Regions.countDocuments()) === 0) {
        await regionsDataCreate();
        shouldUpdateDBCache = true;
      }

      if ((await Venues.countDocuments()) === 0) {
        await venuesDataCreate();
        shouldUpdateDBCache = true;
      }

      if ((await Groups.countDocuments()) === 0) {
        await groupsDataCreate();
        shouldUpdateDBCache = true;
      }

      if ((await Events.countDocuments()) === 0) {
        await eventsDataCreate();
        await eventsDataGenerate();
        shouldUpdateDBCache = true;
      }

      if ((await GroupDiscussions.countDocuments()) === 0) {
        await commentsDataGenerate();
        shouldUpdateDBCache = true;
      }

      if (shouldUpdateDBCache) {
        await updateDbCacheFieldsServerOnly();
      }
    } catch (e) {
      serverError(e);
      throw e;
    }
  },
  { simulation: false },
);
