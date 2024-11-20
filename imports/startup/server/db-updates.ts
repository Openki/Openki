/*
 * This file is used for database updates to migrate the database after the code has changed.
 */

import { Mongo } from "meteor/mongo";

import { update as update20201216MergeUserLocale } from "./updates/2020.12.16 mergeUserLocale";
import { update as update20210106EnsureVenueSlugField } from "./updates/2021.01.06 ensureVenueSlugField";
import { update as update20210112EnsureCourseInterestedField } from "./updates/2021.01.12 ensureCourseInterestedField";
import { update as update20210128PrivateMessagesForAll } from "./updates/2021.01.28 privateMessagesForAll";
import { update as update20210211AvatarColor } from "./updates/2021.02.11 avatarColor";
import { update as update20210218UserDescription } from "./updates/2021.02.18 userDescription";
import { update as update20210329EnrichTenant } from "./updates/2021.03.29 enrichTenant";
import { update as update20210309HistorySubscribeUnsubscribe } from "./updates/2021.03.09 historySubscribeUnsubscribe";
import { update as update20210421EnsureCourseArchivedField } from "./updates/2021.04.21 ensureCourseArchivedField";
import { update as update20210513ensureTenantAdminsField } from "./updates/2021.05.13 ensureTenantAdminsField";
import { update as update20220621EnrichEventCourseImage } from "./updates/2022.06.21 enrichEventCourseImage";
import { update as update20230506extendEventParticipants } from "./updates/2023.05.06 extendEventParticipants";
import { update as update20230802ensureEventSendReminderField } from "./updates/2023.08.02 ensureEventSendReminderField";
import { update as update20240224refactorGroupMembers } from "./updates/2024.02.24 refactorGroupMembers";
import { update as update20241014enrichCourseCompactImage } from "./updates/2024.10.14 enrichCourseCompactImage";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

const UpdatesAvailable: { [name: string]: () => Promise<number> } = {
  "2020.12.16 mergeUserLocale": update20201216MergeUserLocale,
  "2021.01.06 ensureVenueSlugField": update20210106EnsureVenueSlugField,
  "2021.01.12 ensureCourseInterestedField": update20210112EnsureCourseInterestedField,
  "2021.01.28 privateMessagesForAll": update20210128PrivateMessagesForAll,
  "2021.02.11 avatarColor": update20210211AvatarColor,
  "2021.02.18 userDescription": update20210218UserDescription,
  "2021.03.29 enrichTenant": update20210329EnrichTenant,
  "2021.03.09 historySubscribeUnsubscribe": update20210309HistorySubscribeUnsubscribe,
  "2021.04.21 ensureCourseArchivedField": update20210421EnsureCourseArchivedField,
  "2021.05.13 ensureTenantAdminsField": update20210513ensureTenantAdminsField,
  "2022.06.21 enrichEventCourseImage": update20220621EnrichEventCourseImage,
  "2023.05.06 extendEventParticipants": update20230506extendEventParticipants,
  "2023.08.02 ensureEventSendReminderField": update20230802ensureEventSendReminderField,
  "2024.02.24 refactorGroupMembers": update20240224refactorGroupMembers,
  "2024.10.14 enrichCourseCompactImage": update20241014enrichCourseCompactImage,
};

interface UpdatesAppliedEntity {
  name: string;
  affected: number;
  run: Date;
  applied?: Date;
}

const UpdatesApplied = new Mongo.Collection<UpdatesAppliedEntity>("UpdatesApplied");

if (runBackgroundTasks)
  Meteor.startup(async () => {
    const skipInitial = (await UpdatesApplied.find().countAsync()) === 0;

    for (const [name, updateAvailable] of Object.entries(UpdatesAvailable)) {
      // eslint-disable-next-line no-await-in-loop
      if ((await UpdatesApplied.find({ name }).countAsync()) === 0) {
        const entry: UpdatesAppliedEntity = {
          name,
          affected: 0,
          run: new Date(),
        };

        if (skipInitial) {
          /* eslint-disable-next-line no-console */
          console.log(`Skipping update ${name}`);
        } else {
          /* eslint-disable-next-line no-console */
          console.log(`Applying update ${name}`);
          // eslint-disable-next-line no-await-in-loop
          entry.affected = await updateAvailable();
          entry.applied = new Date();
          /* eslint-disable-next-line no-console */
          console.log(`${name}: ${entry.affected} affected documents`);
        }
        // eslint-disable-next-line no-await-in-loop
        await UpdatesApplied.insertAsync(entry);
      }
    }
  });
