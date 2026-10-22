/*
 * This file is used for database updates to migrate the database after the code has changed.
 */

import { Mongo } from "meteor/mongo";

import { runBackgroundTasks } from "/imports/utils/background-tasks";

interface UpdatesAppliedEntity {
  name: string;
  affected: number;
  run: Date;
  applied?: Date;
}

if (runBackgroundTasks) {
  /**
   * These DB updates should be applied.
   *
   * To add a new migration, add a new entry here where the
   * `key` is the filename without the `.ts` extension,
   * and the `value` is a function to dynamically import the update script.
   *
   * NOTE: Never rename DB updates (or their filenames) once they have been added here,
   * because the names are stored in the DB to track which migrations have been applied.
   *
   * There are also some legacy update scripts in the `updates/` directory, but they are ignored.
   */
  const UpdatesAvailable: Record<string, () => Promise<{ update: () => Promise<number> }>> = {
    "2020.12.16 mergeUserLocale": () => import("./updates/2020.12.16 mergeUserLocale"),
    "2021.01.06 ensureVenueSlugField": () => import("./updates/2021.01.06 ensureVenueSlugField"),
    "2021.01.12 ensureCourseInterestedField": () =>
      import("./updates/2021.01.12 ensureCourseInterestedField"),
    "2021.01.28 privateMessagesForAll": () => import("./updates/2021.01.28 privateMessagesForAll"),
    "2021.02.11 avatarColor": () => import("./updates/2021.02.11 avatarColor"),
    "2021.02.18 userDescription": () => import("./updates/2021.02.18 userDescription"),
    "2021.03.29 enrichTenant": () => import("./updates/2021.03.29 enrichTenant"),
    "2021.03.09 historySubscribeUnsubscribe": () =>
      import("./updates/2021.03.09 historySubscribeUnsubscribe"),
    "2021.04.21 ensureCourseArchivedField": () =>
      import("./updates/2021.04.21 ensureCourseArchivedField"),
    "2021.05.13 ensureTenantAdminsField": () =>
      import("./updates/2021.05.13 ensureTenantAdminsField"),
    "2022.06.21 enrichEventCourseImage": () =>
      import("./updates/2022.06.21 enrichEventCourseImage"),
    "2023.05.06 extendEventParticipants": () =>
      import("./updates/2023.05.06 extendEventParticipants"),
    "2023.08.02 ensureEventSendReminderField": () =>
      import("./updates/2023.08.02 ensureEventSendReminderField"),
    "2024.02.24 refactorGroupMembers": () => import("./updates/2024.02.24 refactorGroupMembers"),
    "2024.10.14 enrichCourseCompactImage": () =>
      import("./updates/2024.10.14 enrichCourseCompactImage"),
    "2025.04.07 enrichUserVenues": () => import("./updates/2025.04.07 enrichUserVenues"),
    "2025.07.23 extendEventParticipants": () =>
      import("./updates/2025.07.23 extendEventParticipants"),
    "2025.10.18 ensureVenueAllowParallelEventsField": () =>
      import("./updates/2025.10.18 ensureVenueAllowParallelEventsField"),
    "2026.03.19 renameGroupToOrganizationDbCollection": () =>
      import("./updates/2026.03.19 renameGroupToOrganizationDbCollection"),
    "2026.04.08 renameCourseToGroupDbCollection": () =>
      import("./updates/2026.04.08 renameCourseToGroupDbCollection"),
    "2026.03.11 renameGroupToOrganization": () =>
      import("./updates/2026.03.11 renameGroupToOrganization"),
    "2026.03.13 renameGroupToOrganization2": () =>
      import("./updates/2026.03.13 renameGroupToOrganization2"),
    "2026.03.13 renameGroupToOrganization3": () =>
      import("./updates/2026.03.13 renameGroupToOrganization3"),
    "2026.03.20 moveAllS3FilesFromGroupsToOrganizations": () =>
      import("./updates/2026.03.20 moveAllS3FilesFromGroupsToOrganizations"),
    "2026.04.08 moveAllS3FilesFromCoursesToGroups": () =>
      import("./updates/2026.04.08 moveAllS3FilesFromCoursesToGroups"),
    "2026.04.08 renameCourseToGroupInRegionAndOrganization": () =>
      import("./updates/2026.04.08 renameCourseToGroupInRegionAndOrganization"),
    "2026.04.08 renameCourseToGroupInEventsAndDiscussions": () =>
      import("./updates/2026.04.08 renameCourseToGroupInEventsAndDiscussions"),
    "2026.04.08 renameCourseToGroupInDashboardSettings": () =>
      import("./updates/2026.04.08 renameCourseToGroupInDashboardSettings"),
    "2026.06.04 renameGroupToOrganizationInEvents": () =>
      import("./updates/2026.06.04 renameGroupToOrganizationInEvents"),
    "2026.07.09 cleanupLogData": () => import("./updates/2026.07.09 cleanupLogData"),
    "2026.09.06 refactorGroupRoles": () => import("./updates/2026.09.06 refactorGroupRoles"),
    "2026.09.29 refactorRegionRoles": () => import("./updates/2026.09.29 refactorRegionRoles"),
  };

  const UpdatesApplied = new Mongo.Collection<UpdatesAppliedEntity>("UpdatesApplied");

  async function applyUpdates() {
    /**
     * If the DB is new like for a fresh DEV, CI or production DB,
     * we should not apply any DB updates since the DB already uses the latest schema.
     */
    const skipInitial = (await UpdatesApplied.countDocuments()) === 0;

    // DB updates should run in sequence so we can abort as soon as something fails.
    // oxlint-disable no-await-in-loop
    for (const [name, loadModule] of Object.entries(UpdatesAvailable)) {
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

          // Only load the update scripts into memory to run them.
          // This reduces memory usage when the server starts,
          // and improves startup performance both during dev and production
          // because Node.js needs to parse and execute fewer modules.
          const { update } = await loadModule();

          entry.affected = await update();
          entry.applied = new Date();

          console.log(`${name}: ${entry.affected} affected documents`);
        }

        await UpdatesApplied.insertAsync(entry);
      }
    }
  }

  Meteor.startup(async () => {
    await applyUpdates();
  });
}
