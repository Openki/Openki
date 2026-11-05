import { Meteor } from "meteor/meteor";
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
import { GroupChatMessages } from "/imports/api/group-chat-messages/group-chat-messages";

import { create as groupsDataCreate } from "./groups/create";
import { create as eventsDataCreate } from "./events/create";
import { generate as eventsDataGenerate } from "./events/generate";
import { create as organizationsDataCreate } from "./organizations/create";
import { create as venuesDataCreate } from "./venues/create";
import { generate as groupDiscussionsDataGenerate } from "./group-discussions/generate";
import { create as groupChatMessagesDataCreate } from "./group-chat-messages/create";
import { create as regionsDataCreate } from "./regions/create";
import { usersCreate as usersDataCreate } from "./usersCreate";
import { serverError } from "../log/methods";
import { Invitations } from "../invitations/invitations";
import { JoinLinks } from "../joinLinks/joinLinks";
import { updateDbCacheFieldsServerOnly } from "../db-utilities/updateDbCacheFieldsServerOnly";

/**
 * Private method to reset fixture data. Should only be used on the server side when cleaning fixtures.
 *
 * This assumes the user have sufficient privileges, e.g. being an admin.
 * Also allowed to be used when the server creates missing fixtures at startup.
 */
async function serverOnlyCleanFixtures() {
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
}

/**
 * Private method to create fixture data. Should only be used on the server side when recreating fixtures.
 *
 * This assumes the user have sufficient privileges, e.g. being an admin.
 * Also allowed to be used when the server creates missing fixtures at startup.
 */
export async function serverOnlyCreateFixtures() {
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
     * If you need to ensure the fixtures are fully recreated and the DB cache is fully updated,
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
      await groupDiscussionsDataGenerate();
      shouldUpdateDBCache = true;
    }

    if ((await GroupChatMessages.countDocuments()) === 0) {
      await groupChatMessagesDataCreate();
      shouldUpdateDBCache = true;
    }

    if (shouldUpdateDBCache) {
      await updateDbCacheFieldsServerOnly();
    }
  } catch (e) {
    serverError(e);
    throw e;
  }
}

/**
 * Reset fixture data.
 *
 * Meteor method that can be called from both client and server code during runtime.
 */
export const cleanFixtures = ServerMethod(
  "fixtures.clean",
  async () => {
    const user = await Meteor.userAsync();
    if (!user || !user.hasPrivilege("admin")) {
      return;
    }

    await serverOnlyCleanFixtures();
  },
  { simulation: false },
);

/**
 * Insert new fixture data.
 *
 * This method that can be called from both client and server code during runtime.
 */
export const createFixtures = ServerMethod(
  "fixtures.create",
  async () => {
    const user = await Meteor.userAsync();
    if (!user || !user.hasPrivilege("admin")) {
      return;
    }

    await serverOnlyCreateFixtures();
  },
  { simulation: false },
);
