import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { ServerMethod } from "/imports/utils/ServerMethod";

import { Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { Groups } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";
import { Venues } from "/imports/api/venues/venues";
import { InfoPages } from "../infoPages/infoPages";
import { Tenants } from "../tenants/tenants";
import { CourseDiscussions } from "../course-discussions/course-discussions";

import { create as coursesDataCreate } from "./courses/create";
import { create as eventsDataCreate } from "./events/create";
import { generate as eventsDataGenerate } from "./events/generate";
import { create as groupsDataCreate } from "./groups/create";
import { create as infoPagesDataCreate } from "./infoPages/create";
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
        CourseDiscussions.removeAsync({}),
        Events.removeAsync({}),
        Courses.removeAsync({}),
        Venues.removeAsync({}),
        Regions.removeAsync({}),
        Invitations.removeAsync({}),
        JoinLinks.removeAsync({}),
        Tenants.removeAsync({}),
        Groups.removeAsync({}),
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
      if ((await InfoPages.countDocuments()) === 0) {
        await infoPagesDataCreate();
      }

      await usersDataCreate();

      if ((await Groups.countDocuments()) === 0) {
        await groupsDataCreate();
      }

      if ((await Regions.countDocuments()) === 0) {
        await regionsDataCreate();
      }

      if ((await Venues.countDocuments()) === 0) {
        await venuesDataCreate();
      }

      if ((await Courses.countDocuments()) === 0) {
        await coursesDataCreate();
      }

      if ((await Events.countDocuments()) === 0) {
        await eventsDataCreate();
        await eventsDataGenerate();
      }

      if ((await CourseDiscussions.countDocuments()) === 0) {
        await commentsDataGenerate();
      }
    } catch (e) {
      serverError(e);
      throw e;
    }
  },
  { simulation: false },
);
