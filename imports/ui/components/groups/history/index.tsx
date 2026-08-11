import React from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";

import { EventModel, Events } from "/imports/api/events/events";
import { GroupModel } from "/imports/api/groups/groups";
import { RegionEntity } from "/imports/api/regions/regions";

import { useUser } from "/imports/utils/react-meteor-data";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { ProfileLink } from "../../profile-link";
import { Contribution } from "../../Contribution";
import { OrganizationTag } from "../../organizations/tag";
import { RoleIcon } from "../../RoleIcon";

import "./styles.scss";

export function EventHeldHistoryEntry({ _id, title, slug }: EventModel) {
  return (
    <>
      <i className="fa-regular fa-calendar-days fa-fw" />{" "}
      <a href={Router.path("showEvent", { _id, slug })}>{title}</a>
    </>
  );
}

export function UserSubscribedHistoryEntry({
  user,
  role,
  regionId,
}: {
  user: string;
  role: string;
  regionId: RegionEntity["_id"];
}) {
  const [isLoading, roles] = useRegionRoles(regionId);
  const { groupHistoryUserSubscribed } = useRoleDisplay(roles);

  if (isLoading()) {
    return null;
  }

  return (
    <>
      <RoleIcon type={role} regionId={regionId} />{" "}
      {groupHistoryUserSubscribed(role, {
        USER: (
          <>
            <ProfileLink userId={user} />
            <Contribution userId={user} />
          </>
        ),
      })}
    </>
  );
}
export function UserUnsubscribedHistoryEntry({
  user,
  role,
  regionId,
}: {
  user: string;
  role: string;
  regionId: RegionEntity["_id"];
}) {
  const [isLoading, roles] = useRegionRoles(regionId);
  const { groupHistoryUserUnsubscribed } = useRoleDisplay(roles);

  if (isLoading()) {
    return null;
  }

  return (
    <>
      <RoleIcon type={role} regionId={regionId} />{" "}
      {groupHistoryUserUnsubscribed(role, {
        USER: (
          <>
            <ProfileLink userId={user} />
            <Contribution userId={user} />
          </>
        ),
      })}
    </>
  );
}

export function OrganizationPromoteHistoryEntry({
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
      <>
        <ProfileLink userId={user} />
        <Contribution userId={user} />
      </>
    ),
  };
  return (
    <>
      {enable
        ? t(
            "group.history.organizationPromote.added",
            "{ORGANIZATION} got added by {USER}",
            tOptions,
          )
        : t(
            "group.history.organizationPromote.removed",
            "{ORGANIZATION} got removed by {USER}",
            tOptions,
          )}
    </>
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
      <>
        <ProfileLink userId={user} />
        <Contribution userId={user} />
      </>
    ),
  };
  return (
    <>
      {enable
        ? t(
            "group.history.organizationTeam.added",
            "{ORGANIZATION} got added as coordination-organization by {USER}",
            tOptions,
          )
        : t(
            "group.history.organizationTeam.removed",
            "{ORGANIZATION} got removed as coordination-organization by {USER}",
            tOptions,
          )}
    </>
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
    <>
      <i className="fa-regular fa-calendar-days fa-fw" />{" "}
      {t("group.history.eventInserted", "{EVENT} created by {USER}", {
        EVENT: (
          <a href={Router.path("showEvent", { _id, slug })}>
            {dayOfWeek(startLocal)} {calendarDayShort(startLocal)} {title}
          </a>
        ),
        USER: (
          <>
            <ProfileLink userId={createdBy} />
            <Contribution userId={createdBy} />
          </>
        ),
      })}
    </>
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
  const tOptions = {
    EVENT: (
      <a href={Router.path("showEvent", { _id, slug })}>
        {dayOfWeek(startLocal)} {calendarDayShort(startLocal)} {title}
      </a>
    ),
    USER: (
      <>
        <ProfileLink userId={updatedBy} />
        <Contribution userId={updatedBy} />
      </>
    ),
  };
  return (
    <>
      <i className="fa-regular fa-calendar-days fa-fw" />{" "}
      {replicasUpdated
        ? t(
            "group.history.eventAndRepeatsUpdated",
            "{EVENT} and repeats updated by {USER}",
            tOptions,
          )
        : t("group.history.eventUpdated", "{EVENT} updated by {USER}", tOptions)}
    </>
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
    <>
      <i className="fa-regular fa-calendar-days fa-fw" />{" "}
      {t("group.history.eventRemoved", "{EVENT} removed by {USER}", {
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
      })}
    </>
  );
}

export function UpdatedHistoryEntry({ updatedBy }: { updatedBy: string }) {
  const { t } = useTranslation();
  return (
    <>
      {t("group.history.updated", "Updated by {USER}", {
        USER: (
          <>
            <ProfileLink userId={updatedBy} />
            <Contribution userId={updatedBy} />
          </>
        ),
      })}
    </>
  );
}

export function CreatedHistoryEntry({ createdby }: GroupModel) {
  const { t } = useTranslation();
  return (
    <>
      {t("group.history.created_by", "Created by {USER}", {
        USER: (
          <>
            <ProfileLink userId={createdby} />
            <Contribution userId={createdby} />
          </>
        ),
      })}
    </>
  );
}

const map = {
  updated: UpdatedHistoryEntry,
  userSubscribed: UserSubscribedHistoryEntry,
  userUnsubscribed: UserUnsubscribedHistoryEntry,
  organizationPromote: OrganizationPromoteHistoryEntry,
  organizationTeam: OrganizationTeamHistoryEntry,
  eventInserted: EventInsertedHistoryEntry,
  eventUpdated: EventUpdatedHistoryEntry,
  eventRemoved: EventRemovedHistoryEntry,
} as const;

export function History({ group }: { group: GroupModel }) {
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
    return historyEntries
      .sort((a, b) => (b.dateTime?.getTime() || 0) - (a.dateTime?.getTime() || 0))
      .slice(0, 200); // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
  }
  const { dateLong, fromNow } = useDateTimeFormat();
  return (
    <div className="container">
      <div className="timeline-pre row">
        <div className="col-1 offset-3">
          <div className="timeline-start"></div>
        </div>
      </div>
      {pastEventsList().map((event, index) => (
        <div className="row" key={index}>
          <div className="timeline-eventdate col-3" title={dateLong(event.dateTime)}>
            {fromNow(event.dateTime)}
          </div>
          <div className="timeline-eventline-container col-1">
            <div className="timeline-eventline">
              <div className="timeline-eventpoint"></div>
            </div>
          </div>
          <div className="grouphistory-event col-8">
            <event.template {...event.data} />
          </div>
        </div>
      ))}
      <div className="timeline-post row">
        <div className="col-1 offset-3">
          <div className="timeline-end"></div>
        </div>
      </div>
    </div>
  );
}
