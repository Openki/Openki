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
import { update as update20250407enrichUserVenues } from "./updates/2025.04.07 enrichUserVenues";
import { update as update20250723extendEventParticipants } from "./updates/2025.07.23 extendEventParticipants";
import { update as update20251018ensureVenueAllowParallelEvents } from "./updates/2025.10.18 ensureVenueAllowParallelEventsField";
import { update as update20260319renameGroupToOrganizationDbCollection } from "./updates/2026.03.19 renameGroupToOrganizationDbCollection";
import { update as update20260311renameGroupToOrganization } from "./updates/2026.03.11 renameGroupToOrganization";
import { update as update20260313renameGroupToOrganization2 } from "./updates/2026.03.13 renameGroupToOrganization2";
import { update as update20260313renameGroupToOrganization3 } from "./updates/2026.03.13 renameGroupToOrganization3";
import { update as update20260320moveAllS3FilesFromGroupsToOrganizations } from "./updates/2026.03.20 moveAllS3FilesFromGroupsToOrganizations";
import { update as update20260408moveAllS3FilesFromCoursesToGroups } from "./updates/2026.04.08 moveAllS3FilesFromCoursesToGroups";
import { update as update20260408renameCourseToGroupDbCollection } from "./updates/2026.04.08 renameCourseToGroupDbCollection";
import { update as update20260408renameCourseToGroupInEventsAndDiscussions } from "./updates/2026.04.08 renameCourseToGroupInEventsAndDiscussions";
import { update as update20260408renameCourseToGroupInDashboardSettings } from "./updates/2026.04.08 renameCourseToGroupInDashboardSettings";
import { update as update20260408renameCourseToGroupInRegionAndOrganization } from "./updates/2026.04.08 renameCourseToGroupInRegionAndOrganization";
import { update as update20260604renameGroupToOrganizationInEvents } from "./updates/2026.06.04 renameGroupToOrganizationInEvents";
import { update as update20260709cleanupLogData } from "./updates/2026.07.09 cleanupLogData";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

const UpdatesAvailable: Record<string, () => Promise<number>> = {
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
  "2025.04.07 enrichUserVenues": update20250407enrichUserVenues,
  "2025.07.23 extendEventParticipants": update20250723extendEventParticipants,
  "2025.10.18 ensureVenueAllowParallelEventsField": update20251018ensureVenueAllowParallelEvents,
  "2026.03.19 renameGroupToOrganizationDbCollection":
    update20260319renameGroupToOrganizationDbCollection,
  "2026.04.08 renameCourseToGroupDbCollection": update20260408renameCourseToGroupDbCollection,
  "2026.03.11 renameGroupToOrganization": update20260311renameGroupToOrganization,
  "2026.03.13 renameGroupToOrganization2": update20260313renameGroupToOrganization2,
  "2026.03.13 renameGroupToOrganization3": update20260313renameGroupToOrganization3,
  "2026.03.20 moveAllS3FilesFromGroupsToOrganizations":
    update20260320moveAllS3FilesFromGroupsToOrganizations,
  "2026.04.08 moveAllS3FilesFromCoursesToGroups": update20260408moveAllS3FilesFromCoursesToGroups,
  "2026.04.08 renameCourseToGroupInRegionAndOrganization":
    update20260408renameCourseToGroupInRegionAndOrganization,
  "2026.04.08 renameCourseToGroupInEventsAndDiscussions":
    update20260408renameCourseToGroupInEventsAndDiscussions,
  "2026.04.08 renameCourseToGroupInDashboardSettings":
    update20260408renameCourseToGroupInDashboardSettings,
  "2026.06.04 renameGroupToOrganizationInEvents": update20260604renameGroupToOrganizationInEvents,
  "2026.07.09 cleanupLogData": update20260709cleanupLogData,
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
    const skipInitial = (await UpdatesApplied.countDocuments()) === 0;

    for (const [name, updateAvailable] of Object.entries(UpdatesAvailable)) {
      if ((await UpdatesApplied.countDocuments({ name })) === 0) {
        const entry: UpdatesAppliedEntity = {
          name,
          affected: 0,
          run: new Date(),
        };

        if (skipInitial) {
          console.log(`Skipping update ${name}`);
        } else {
          console.log(`Applying update ${name}`);

          entry.affected = await updateAvailable();
          entry.applied = new Date();

          console.log(`${name}: ${entry.affected} affected documents`);
        }

        await UpdatesApplied.insertAsync(entry);
      }
    }
  });
