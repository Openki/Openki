import React, { Fragment } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";

import { Events, type EventModel } from "/imports/api/events/events";
import { GroupCustomRole, type GroupModel } from "/imports/api/groups/groups";
import { type RegionEntity } from "/imports/api/regions/regions";
import { type UserModel } from "/imports/api/users/users";

import { useUser } from "/imports/utils/react-meteor-data";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { predefinedRole, RoleType } from "/imports/api/groups/lib/Role";
import { getFragmentsWithKeys } from "/imports/ui/lib/getFragmentsWithKeys";

import { ProfileLink } from "../../profile-link";
import { Contribution } from "../../Contribution";
import { OrganizationTag } from "../../organizations/tag";
import { RoleIcon } from "../../RoleIcon";

import "./styles.scss";

/**
 * Some HistoryEntry renderers need an additional `keyPrefix` to create unique React `key`s for their content.
 */
interface WithHistoryEntryKeyPrefix {
  keyPrefix: string;
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
  keyPrefix,
}: { updatedBy: string } & WithHistoryEntryKeyPrefix) {
  const { t } = useTranslation();
  return (
    <Fragment key={`${keyPrefix}:${updatedBy}`}>
      {t("group.history.updated", "Updated by {USER}", {
        USER: (
          <Fragment key={keyPrefix}>
            <ProfileLink userId={updatedBy} />
            <Contribution userId={updatedBy} />
          </Fragment>
        ),
      })}
    </Fragment>
  );
}

export function CreatedHistoryEntry({
  _id,
  createdby,
  keyPrefix,
}: GroupModel & WithHistoryEntryKeyPrefix) {
  const { t } = useTranslation();
  return (
    <Fragment key={keyPrefix}>
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
 * Get a sorted list of history entries for a specific group.
 * The result varies based on user permissions because some events are internal to group admins.
 * @returns An array of sorted history entries, mapped to their respective React component to use for rendering
 */
const getGroupHistoryEntries = (group: GroupModel, user: UserModel | null) => {
  // Show full history only for admins
  const history =
    user && group.editableBy(user)
      ? group.history
      : group.history?.filter(
          (e) => e.type !== "organizationPromote" && e.type !== "organizationTeam",
        );

  const pastEvents = Events.find(
    { groupId: group._id, start: { $lt: new Date() } },
    {
      limit: 100, // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
      transform: (e) => ({
        type: "pastEvent" as const,
        keyPrefix: `pastEvent:${e._id}:${e.start.getTime()}`,
        dateTime: e.start,
        data: e,
      }),
    },
  ).fetch();

  const remainingHistoryEntries =
    history?.map((e) => ({
      type: e.type,
      keyPrefix: `${e.type}:${e.dateTime.getTime()}`,
      dateTime: e.dateTime,
      data: { ...e.data, regionId: group.region },
    })) ?? [];

  const groupCreated = {
    type: "groupCreated" as const,
    keyPrefix: `groupCreated:${group._id}:${group.time_created.getTime()}`,
    dateTime: group.time_created,
    data: group,
  };

  // Merge events and sort so recent events appear at the top of the history
  const sortedHistory = [...pastEvents, ...remainingHistoryEntries, groupCreated]
    .sort((a, b) => (b.dateTime?.getTime() || 0) - (a.dateTime?.getTime() || 0))
    .slice(0, 200) // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
    // Map to the right renderer
    .map((entry) => ({
      ...entry,
      template: getHistoryEntryTemplate(entry.type),
    }));

  return sortedHistory;
};

export function History({ group }: { group: GroupModel }) {
  const user = useUser();
  const historyEntries = getGroupHistoryEntries(group, user);

  const { dateLong, fromNow } = useDateTimeFormat();
  return (
    <div className="container">
      <div className="timeline-pre row">
        <div className="col-1 offset-3">
          <div className="timeline-start"></div>
        </div>
      </div>
      {historyEntries.map((event, index) => {
        return (
          <div className="row" key={`history:${event.keyPrefix}:${index}`}>
            <div className="timeline-eventdate col-3" title={dateLong(event.dateTime)}>
              {fromNow(event.dateTime)}
            </div>
            <div className="timeline-eventline-container col-1">
              <div className="timeline-eventline">
                <div className="timeline-eventpoint"></div>
              </div>
            </div>
            <div className="grouphistory-event col-8">
              {/* @ts-expect-error Ignore the event data error for now since we don't know what is stored in the DB */}
              <event.template {...event.data} keyPrefix={event.keyPrefix} />
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
