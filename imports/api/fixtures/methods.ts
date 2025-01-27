import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { ServerMethod } from "/imports/utils/ServerMethod";

import { Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { Groups } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { Venues } from "/imports/api/venues/venues";

import { create as coursesDataCreate } from "./courses/create";
import { create as eventsDataCreate } from "./events/create";
import { generate as eventsDataGenerate } from "./events/generate";
import { create as groupsDataCreate } from "./groups/create";
import { create as infoPagesDataCreate } from "./infoPages/create";
import { create as regionsDataCreate } from "./regions/create";
import { create as venuesDataCreate } from "./venues/create";
import { generate as commentsDataGenerate } from "./comments/generate";
import { usersCreate as usersDataCreate } from "./usersCreate";

export const clean = ServerMethod(
  "fixtures.clean",
  () => {
    if (!PrivateSettings.testdata) {
      return;
    }
    Groups.removeAsync({});
    Events.removeAsync({});
    Venues.removeAsync({});
    Courses.removeAsync({});
  },
  { simulation: false },
);

export const create = ServerMethod(
  "fixtures.create",
  async () => {
    if (!PrivateSettings.testdata) {
      return;
    }

    await infoPagesDataCreate();
    if ((await Regions.countDocuments()) === 0) {
      await regionsDataCreate();
    }
    await usersDataCreate();
    await groupsDataCreate();
    await venuesDataCreate();
    await coursesDataCreate();
    await eventsDataGenerate();
  },
  { simulation: false },
);

export const infoPagesCreate = ServerMethod(
  "fixtures.infoPages.create",
  async () => {
    if (!PrivateSettings.testdata) {
      return null;
    }

    return infoPagesDataCreate();
  },
  { simulation: false },
);
export const usersCreate = ServerMethod(
  "fixtures.users.create",
  async () => {
    if (!PrivateSettings.testdata) {
      return null;
    }

    return usersDataCreate();
  },
  { simulation: false },
);

export const regionsCreate = ServerMethod(
  "fixtures.regions.create",
  async () => {
    if (!PrivateSettings.testdata) {
      return null;
    }

    return regionsDataCreate();
  },
  { simulation: false },
);

export const groupsCreate = ServerMethod(
  "fixtures.groups.create",
  async () => {
    if (!PrivateSettings.testdata) {
      return null;
    }

    return groupsDataCreate();
  },
  { simulation: false },
);

export const eventsCreate = ServerMethod(
  "fixtures.events.create",
  async () => {
    if (!PrivateSettings.testdata) {
      return null;
    }

    return eventsDataCreate();
  },
  { simulation: false },
);

export const venuesCreate = ServerMethod(
  "fixtures.venues.create",
  async () => {
    if (!PrivateSettings.testdata) {
      return null;
    }

    return venuesDataCreate();
  },
  { simulation: false },
);

export const coursesCreate = ServerMethod(
  "fixtures.courses.create",
  async () => {
    if (!PrivateSettings.testdata) {
      return null;
    }

    return coursesDataCreate();
  },
  { simulation: false },
);

export const eventsGenerate = ServerMethod(
  "fixtures.events.generate",
  async () => {
    if (!PrivateSettings.testdata) {
      return null;
    }

    return eventsDataGenerate();
  },
  { simulation: false },
);

export const commentsGenerate = ServerMethod(
  "fixtures.comments.generate",
  async () => {
    if (!PrivateSettings.testdata) {
      return null;
    }

    return commentsDataGenerate();
  },
  { simulation: false },
);
