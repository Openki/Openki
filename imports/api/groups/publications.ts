import { check } from "meteor/check";

import { Groups, FindFilter } from "./groups";

import { ServerPublishMany, ServerPublishOne } from "/imports/utils/ServerPublish";
import { FieldSort } from "/imports/utils/sort-spec";
import { visibleTenants, visibleTenantsAsync } from "/imports/utils/visible-tenants";

export const [details, useDetails] = ServerPublishOne(
  "groupDetails",
  async (groupId: string) => {
    check(groupId, String);

    return Groups.find({ _id: groupId, tenant: { $in: await visibleTenantsAsync() } });
  },
  (groupId) => Groups.findOne({ _id: groupId, tenant: { $in: visibleTenants() } }),
);

export const [findFilter, useFindFilter] = ServerPublishMany(
  "Groups.findFilter",
  async (filter?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
    Groups.findFilter({ ...filter, tenants: await visibleTenantsAsync() }, limit, skip, sort),
  (filter?, limit?, skip?, sort?) =>
    Groups.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sort),
);

// IDEA: Can a Meteor publication return custom data or does it have to be related to collections?
// Maybe by returning multiple cursors
// It's probably easier to use a Meteor method to load and aggregate custom data via an RPC function.
// export const [history, useGroupHistory] = ServerPublishMany(
//   "groupHistory",
//   async (groupId: string) => {
//     check(groupId, String);

//     const user = Meteor.user();

//     // Show full history only for admins
//     const history =
//       user && group.editableBy(user)
//         ? group.history
//         : group.history?.filter(
//             (e) => e.type !== "organizationPromote" && e.type !== "organizationTeam",
//           );

//     const pastEvents = useTracker(
//       () =>
//         Events.find(
//           { groupId: group._id, start: { $lt: new Date() } },
//           {
//             limit: 100, // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
//             transform: (e) => ({
//               key: "event_" + e._id,
//               dateTime: e.start,
//               template: EventHeldHistoryEntry,
//               data: e,
//             }),
//           },
//         ).fetch(),
//       [group],
//     );
//     console.dir({ pastEvents });

//     // Merge with
//     const remainingHistoryEntries =
//       history?.map((e) => {
//         const key = `${e.type}_${e.dateTime.getTime()}`;
//         console.dir({ event: e, key });
//         return {
//           key,
//           dateTime: e.dateTime,
//           template: (map as any)[e.type],
//           data: { ...e.data, regionId: group.region },
//         };
//       }) ?? [];

//     const groupCreated = {
//       key: "group_" + group._id,
//       dateTime: group.time_created,
//       template: CreatedHistoryEntry,
//       data: group,
//     };

//     // and sort by date time desc
//     const sorted = [...pastEvents, ...remainingHistoryEntries, groupCreated]
//       // NOTE: Maybe we need to slice the array here?
//       .sort((a, b) => (b.dateTime?.getTime() || 0) - (a.dateTime?.getTime() || 0))
//       .slice(0, 200); // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
//   },
// );
