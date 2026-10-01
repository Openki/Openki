import React, { Fragment, useEffect, useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";

import { type EventModel } from "/imports/api/events/events";
import { GroupCustomRole, GroupModel } from "/imports/api/groups/groups";
import { RegionEntity } from "/imports/api/regions/regions";

import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { predefinedRole, RoleType } from "/imports/api/groups/lib/Role";
import { getGroupHistory } from "/imports/api/groups/methods";

import { ProfileLink } from "../../profile-link";
import { Contribution } from "../../Contribution";
import { OrganizationTag } from "../../organizations/tag";
import { RoleIcon } from "../../RoleIcon";

import "./styles.scss";
import { getFragmentsWithKeys } from "/imports/ui/lib/getFragmentsWithKeys";

/** Used to add a generated key to HistoryEntry props */
interface WithHistoryEntryKey {
  _key: string;
}

export function EventHeldHistoryEntry({ _id, title, slug }: EventModel) {
  return (
    <Fragment key={`eventHeld:${_id}`}>
      <i className="fa-regular fa-calendar-days fa-fw" />{" "}
      <a href={Router.path("showEvent", { _id, slug })}>{title}</a>
    </Fragment>
  );
}

export function UserSubscribedHistoryEntry({
  user: userId,
  roleId,
  regionId,
}: {
  user: string;
  roleId: string;
  regionId: RegionEntity["_id"];
}) {
  const [isLoading, regionRoles] = useRegionRoles(regionId);
  const { roleGroupHistoryUserSubscribed } = useRoleDisplay(regionRoles);

  if (isLoading()) {
    return null;
  }

  const role = predefinedRole(roleId);
  return (
    <Fragment key={`subscribed:${userId}:${regionId}`}>
      <RoleIcon role={role} regionRoles={regionRoles} />{" "}
      {getFragmentsWithKeys(
        roleGroupHistoryUserSubscribed(role, {
          USER: (
            <Fragment key="subscribed:user">
              <ProfileLink userId={userId} />
              <Contribution userId={userId} />
            </Fragment>
          ),
        }),
      )}
    </Fragment>
  );
}
export function UserUnsubscribedHistoryEntry({
  user: userId,
  roleId,
  regionId,
}: {
  user: string;
  roleId: string;
  regionId: RegionEntity["_id"];
}) {
  const [isLoading, regionRoles] = useRegionRoles(regionId);
  const { roleGroupHistoryUserUnsubscribed } = useRoleDisplay(regionRoles);

  if (isLoading()) {
    return null;
  }

  const role = predefinedRole(roleId);
  return (
    <Fragment key={`unsubscribed:${userId}`}>
      <RoleIcon role={role} regionRoles={regionRoles} />{" "}
      {roleGroupHistoryUserUnsubscribed(role, {
        USER: (
          <Fragment key="unsubscibed:user">
            <ProfileLink userId={userId} />
            <Contribution userId={userId} />
          </Fragment>
        ),
      })}
    </Fragment>
  );
}
export function UserSubscribedToCustomRoleHistoryEntry({
  user: userId,
  roleLabel,
}: {
  user: string;
  roleLabel: GroupCustomRole["label"];
}) {
  const { roleGroupHistoryUserSubscribed } = useRoleDisplay([]);

  const role = { label: roleLabel, type: RoleType.Custom } as const;
  return (
    <Fragment key={`subscribed:customRole:${userId}`}>
      {getFragmentsWithKeys(
        roleGroupHistoryUserSubscribed(role, {
          USER: (
            <Fragment key="subscribed:customRole">
              <ProfileLink userId={userId} />
              <Contribution userId={userId} />
            </Fragment>
          ),
        }),
      )}
    </Fragment>
  );
}
export function UserUnsubscribedFromCustomRoleHistoryEntry({
  user: userId,
  roleLabel,
}: {
  user: string;
  roleLabel: GroupCustomRole["label"];
}) {
  const { roleGroupHistoryUserUnsubscribed } = useRoleDisplay([]);

  const role = { label: roleLabel, type: RoleType.Custom } as const;
  return (
    <Fragment key={`unsubscribed:customRole:${userId}`}>
      {getFragmentsWithKeys(
        roleGroupHistoryUserUnsubscribed(role, {
          USER: (
            <>
              <ProfileLink userId={userId} />
              <Contribution userId={userId} />
            </>
          ),
        }),
      )}
    </Fragment>
  );
}

export function OrganizationPromoteHistoryEntry({
  user: userId,
  organization: organizationId,
  enable,
}: {
  user: string;
  organization: string;
  enable: boolean;
}) {
  const { t } = useTranslation();
  const tOptions = {
    ORGANIZATION: <OrganizationTag organizationId={organizationId} full={true} />,
    USER: (
      <Fragment key="organizationPromote">
        <ProfileLink userId={userId} />
        <Contribution userId={userId} />
      </Fragment>
    ),
  };
  return (
    <Fragment key={`organizationPromote:${organizationId}:${enable}`}>
      {getFragmentsWithKeys(
        enable
          ? t(
              "group.history.organizationPromote.added",
              "{ORGANIZATION} got added by {USER}",
              tOptions,
            )
          : t(
              "group.history.organizationPromote.removed",
              "{ORGANIZATION} got removed by {USER}",
              tOptions,
            ),
      )}
    </Fragment>
  );
}

export function OrganizationTeamHistoryEntry({
  user,
  organization,
  enable,
}: {
  user: string;
  organization: string;
  enable: boolean;
}) {
  const { t } = useTranslation();
  const tOptions = {
    ORGANIZATION: <OrganizationTag organizationId={organization} full={true} />,
    USER: (
      <Fragment key="organizationTeam">
        <ProfileLink userId={user} />
        <Contribution userId={user} />
      </Fragment>
    ),
  };
  return (
    <Fragment key={`organizationTeam:${organization}:${enable}`}>
      {getFragmentsWithKeys(
        enable
          ? t(
              "group.history.organizationTeam.added",
              "{ORGANIZATION} got added as coordination-organization by {USER}",
              tOptions,
            )
          : t(
              "group.history.organizationTeam.removed",
              "{ORGANIZATION} got removed as coordination-organization by {USER}",
              tOptions,
            ),
      )}
    </Fragment>
  );
}

export function EventInsertedHistoryEntry({
  _id,
  slug,
  title,
  startLocal,
  createdBy,
}: {
  _id: string;
  slug: string;
  title: string;
  startLocal: string;
  createdBy: string;
}) {
  const { t } = useTranslation();
  const { dayOfWeek, calendarDayShort } = useDateTimeFormat();

  return (
    <Fragment key={`eventInserted:${startLocal}:${title}`}>
      <i className="fa-regular fa-calendar-days fa-fw" />{" "}
      {getFragmentsWithKeys(
        t("group.history.eventInserted", "{EVENT} created by {USER}", {
          EVENT: (
            <a href={Router.path("showEvent", { _id, slug })}>
              {dayOfWeek(startLocal)} {calendarDayShort(startLocal)} {title}
            </a>
          ),
          USER: (
            <Fragment key="eventInserted">
              <ProfileLink userId={createdBy} />
              <Contribution userId={createdBy} />
            </Fragment>
          ),
        }),
      )}
    </Fragment>
  );
}

export function EventUpdatedHistoryEntry({
  _id,
  slug,
  title,
  startLocal,
  updatedBy,
  replicasUpdated,
}: {
  _id: string;
  slug: string;
  title: string;
  startLocal: string;
  updatedBy: string;
  replicasUpdated: boolean;
}) {
  const { t } = useTranslation();
  const { dayOfWeek, calendarDayShort } = useDateTimeFormat();
  const key = `eventUpdated:${_id}:${title}:${startLocal}:${updatedBy}`;
  const tOptions = {
    EVENT: (
      <a href={Router.path("showEvent", { _id, slug })}>
        {dayOfWeek(startLocal)} {calendarDayShort(startLocal)} {title}
      </a>
    ),
    USER: (
      <Fragment key={`${key}:user`}>
        <ProfileLink userId={updatedBy} key={`${key}:profileLink`} />
        <Contribution userId={updatedBy} key={`${key}:contribution`} />
      </Fragment>
    ),
  };
  return (
    <Fragment key={key}>
      <i className="fa-regular fa-calendar-days fa-fw" />{" "}
      {getFragmentsWithKeys(
        replicasUpdated
          ? t(
              "group.history.eventAndRepeatsUpdated",
              "{EVENT} and repeats updated by {USER}",
              tOptions,
            )
          : t("group.history.eventUpdated", "{EVENT} updated by {USER}", tOptions),
      )}
    </Fragment>
  );
}

export function EventRemovedHistoryEntry({
  startLocal,
  title,
  removedBy,
}: {
  removedBy: string;
  title: string;
  startLocal: string;
}) {
  const { t } = useTranslation();
  const { dayOfWeek, calendarDayShort } = useDateTimeFormat();
  return (
    <Fragment key={`eventRemoved:${title}:${startLocal}`}>
      <i className="fa-regular fa-calendar-days fa-fw" />{" "}
      {getFragmentsWithKeys(
        t("group.history.eventRemoved", "{EVENT} removed by {USER}", {
          EVENT: (
            <>
              {dayOfWeek(startLocal)} {calendarDayShort(startLocal)} {title}
            </>
          ),
          USER: (
            <>
              <ProfileLink userId={removedBy} />
              <Contribution userId={removedBy} />
            </>
          ),
        }),
      )}
    </Fragment>
  );
}

export function UpdatedHistoryEntry({
  updatedBy,
  _key,
}: { updatedBy: string } & WithHistoryEntryKey) {
  const { t } = useTranslation();
  return (
    <Fragment key={_key + `:${updatedBy}`}>
      {t("group.history.updated", "Updated by {USER}", {
        USER: (
          <Fragment key={_key}>
            <ProfileLink userId={updatedBy} />
            <Contribution userId={updatedBy} />
          </Fragment>
        ),
      })}
    </Fragment>
  );
}

export function CreatedHistoryEntry({ _id, createdby, _key }: GroupModel & WithHistoryEntryKey) {
  const { t } = useTranslation();
  return (
    <Fragment key={_key}>
      {getFragmentsWithKeys(
        t("group.history.created_by", "Created by {USER}", {
          USER: (
            <Fragment key={`group:${_id}:created:user`}>
              <ProfileLink userId={createdby} />
              <Contribution userId={createdby} />
            </Fragment>
          ),
        }),
      )}
    </Fragment>
  );
}

const map = {
  updated: UpdatedHistoryEntry,
  userSubscribed: UserSubscribedHistoryEntry,
  userUnsubscribed: UserUnsubscribedHistoryEntry,
  userSubscribedToCustomRole: UserSubscribedToCustomRoleHistoryEntry,
  userUnsubscribedFromCustomRole: UserUnsubscribedFromCustomRoleHistoryEntry,
  organizationPromote: OrganizationPromoteHistoryEntry,
  organizationTeam: OrganizationTeamHistoryEntry,
  eventInserted: EventInsertedHistoryEntry,
  eventUpdated: EventUpdatedHistoryEntry,
  eventRemoved: EventRemovedHistoryEntry,
  groupCreated: CreatedHistoryEntry,
  pastEvent: EventHeldHistoryEntry,
} as const;

function getHistoryEntryTemplate(key: string) {
  const template = map[key as keyof typeof map];
  if (!template) {
    throw new Error("Missing template for group history entry: " + key);
  }
  return template;
}

/**
 * Load the data required for history events and only return data once it's all ready to prevent double renders
 * Create unique keys for every history entry.
 */
/*function useHistoryEvents({ group }: { group: GroupModel }) {
  // [
  // isLoading: boolean,
  // historyEvents: {
  //   key: string;
  //   dateTime: Date | undefined;
  //   template: React.FC<any>;
  //   data: EventModel | GroupModel | (object & { regionId: GroupModel["region"] });
  // }[],
  // ]
  const user = useUser();

  function pastEventsList() {
    const historyEntries: { dateTime: Date | undefined; template: React.FC<any>; data: object }[] =
      [];

    const history =
      user && group.editableBy(user)
        ? group.history
        : group.history?.filter(
            (e) => e.type !== "organizationPromote" && e.type !== "organizationTeam",
          );

    // add past events
    historyEntries.push(
      ...Events.find(
        { groupId: group._id, start: { $lt: new Date() } },
        { limit: 100 }, // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
      ).map((e) => ({
        dateTime: e.start,
        template: EventHeldHistoryEntry,
        data: e,
      })),
    );

    // merge with all history entries
    historyEntries.push(
      ...(history?.map((e) => ({
        dateTime: e.dateTime,
        template: (map as any)[e.type],
        data: { ...e.data, regionId: group.region },
      })) ?? []),
    );

    // and with the group creation
    historyEntries.push({
      dateTime: group.time_created,
      template: CreatedHistoryEntry,
      data: group,
    });

  // and sort by date time desc
  const sorted = [...pastEvents, ...remainingHistoryEntries, groupCreated]
    // NOTE: Maybe we need to slice the array here?
    .sort((a, b) => (b.dateTime?.getTime() || 0) - (a.dateTime?.getTime() || 0))
    .slice(0, 200); // Hack: https://gitlab.com/Openki/Openki/-/issues/1768

  // NOTE: It seems like we can't use isLoading with  trackers, so let's skip it for now
  //
  // TODO: Make this a combination of all loading states and resolve once all of them are done
  // const isLoading = true;
  // TODO: Return the combined data after everything has loaded.
  // return isLoading ? [true, []] : [false, [...pastEvents]];

  console.dir({ sorted });

  return sorted;
}*/

function useGroupHistory(groupId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [groupHistory, setGroupHistory] = useState<Awaited<ReturnType<typeof getGroupHistory>>>([]);

  useEffect(() => {
    getGroupHistory(groupId)
      .then((historyEntries) => {
        setGroupHistory(
          historyEntries.map((entry) => ({
            ...entry,
            template: getHistoryEntryTemplate(entry.type),
          })),
        );
      })
      .finally(() => setIsLoading(false));
  }, [groupId]);

  return [isLoading, groupHistory] as const;
}

export function History({ group }: { group: GroupModel }) {
  // const user = useUser();

  // function pastEventsList() {
  //   const history =
  //     user && group.editableBy(user)
  //       ? group.history
  //       : group.history?.filter(
  //           (e) => e.type !== "organizationPromote" && e.type !== "organizationTeam",
  //         );

  //   // add past events
  //   historyEntries.push(
  //     ...Events.find(
  //       { groupId: group._id, start: { $lt: new Date() } },
  //       { limit: 100 }, // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
  //     ).map((e) => ({
  //       key: "event" + e._id,
  //       dateTime: e.start,
  //       template: EventHeldHistoryEntry,
  //       data: e,
  //     })),
  //   );

  //   // merge with all history entries
  //   historyEntries.push(
  //     ...(history?.map((e) => {
  //       const key = `${e.type}_${e.dateTime.getTime()}`;
  //       console.dir({ event: e, key });
  //       return {
  //         key,
  //         dateTime: e.dateTime,
  //         template: (map as any)[e.type],
  //         data: { ...e.data, regionId: group.region },
  //       };
  //     }) ?? []),
  //   );

  //   // and with the group creation
  //   historyEntries.push({
  //     key: "group_" + group._id,
  //     dateTime: group.time_created,
  //     template: CreatedHistoryEntry,
  //     data: group,
  //   });

  //   // and sort by date time desc
  //   const sorted = historyEntries
  //     .sort((a, b) => (b.dateTime?.getTime() || 0) - (a.dateTime?.getTime() || 0))
  //     .slice(0, 200); // Hack: https://gitlab.com/Openki/Openki/-/issues/1768

  //   // TODO: Ensure there are no duplicates - there are none, but some values get repeated as more items are loaded
  //   // IDEA: The likely cause could be that we mutate the array during re-renders, which might cause side-effects that break the rendering.

  //   const unique = new Map<string, (typeof sorted)[number]>();

  //   for (const item of sorted) {
  //     if (unique.has(item.key)) {
  //       console.dir({ existing: unique.get(item.key), new: item });
  //       throw new Error("Duplicate key found!");
  //     }
  //     unique.set(item.key, item);
  //   }

  //   // we render twice. Maybe we should load the data in a different way instead? Then we could
  //   // Maybe we could use a react hook to properly wait for the data to load before showing it?
  //   console.dir({ sorted });

  //   return sorted;
  // }

  // const [isLoading, historyEvents] = useHistoryEvents({ group });
  // const historyEvents = useHistoryEvents({ group });
  const [isLoading, historyEvents] = useGroupHistory(group._id);

  const { dateLong, fromNow } = useDateTimeFormat();
  return (
    <div className="container">
      <div className="timeline-pre row">
        <div className="col-1 offset-3">
          <div className="timeline-start"></div>
        </div>
      </div>
      {!isLoading &&
        historyEvents.map((event, index) => {
          // const key = `${event.dateTime?.getTime() || 0}_${index}`
          // const key = "regionId" in event.data ? event.data.regionId : "region" in event.data ? event.data.region :
          return (
            <div className="row" key={`history:${event.key}:${index}`}>
              <div className="timeline-eventdate col-3" title={dateLong(event.dateTime)}>
                {fromNow(event.dateTime)}
              </div>
              <div className="timeline-eventline-container col-1">
                <div className="timeline-eventline">
                  <div className="timeline-eventpoint"></div>
                </div>
              </div>
              <div className="grouphistory-event col-8">
                {/* @ts-expect-error Ignore the event data error for now */}
                <event.template {...event.data} _key={event.key} />
              </div>
            </div>
          );
        })}
      <div className="timeline-post row">
        <div className="col-1 offset-3">
          <div className="timeline-end"></div>
        </div>
      </div>
    </div>
  );
}
