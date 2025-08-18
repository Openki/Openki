import React from "react";

import { Router } from "meteor/iron:router";
import { EventModel, Events } from "/imports/api/events/events";
import { CourseModel } from "/imports/api/courses/courses";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { useRoleDisplay } from "../../../lib/useRoleDisplay";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { ProfileLink } from "../../profile-link";
import { Contribution } from "../../Contribution";
import { GroupTag } from "../../groups/tag";
import { RoleIcon } from "/imports/ui/RoleIcon";

import "./styles.scss";

export function EventHeldHistoryEntry({ _id, title, slug }: EventModel) {
  return (
    <>
      <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>{" "}
      <a href={Router.path("showEvent", { _id, slug })}>{title}</a>
    </>
  );
}

export function UserSubscribedHistoryEntry({ user, role }: { user: string; role: string }) {
  const { t } = useTranslation();
  const { roleShort } = useRoleDisplay();
  return (
    <>
      <RoleIcon type={role} />{" "}
      {t("course.history.userSubscribed", "{USER} joined as {ROLE}", {
        USER: (
          <>
            <ProfileLink userId={user} />
            <Contribution userId={user} />
          </>
        ),
        ROLE: roleShort(role),
      })}
    </>
  );
}
export function UserUnsubscribedHistoryEntry({ user, role }: { user: string; role: string }) {
  const { t } = useTranslation();
  const { roleShort } = useRoleDisplay();
  return (
    <>
      <RoleIcon type={role} />{" "}
      {t("course.history.userUnsubscribed", "{USER} retract {ROLE}", {
        USER: (
          <>
            <ProfileLink userId={user} />
            <Contribution userId={user} />
          </>
        ),
        ROLE: roleShort(role),
      })}
    </>
  );
}

export function GroupPromoteHistoryEntry({
  user,
  group,
  enable,
}: {
  user: string;
  group: string;
  enable: boolean;
}) {
  const { t } = useTranslation();
  const tOptions = {
    GROUP: <GroupTag groupId={group} full={true} />,
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
        ? t("course.history.groupPromote.added", "{GROUP} got added by {USER}", tOptions)
        : t("course.history.groupPromote.removed", "{GROUP} got removed by {USER}", tOptions)}
    </>
  );
}

export function GroupOrgaHistoryEntry({
  user,
  group,
  enable,
}: {
  user: string;
  group: string;
  enable: boolean;
}) {
  const { t } = useTranslation();
  const tOptions = {
    GROUP: <GroupTag groupId={group} full={true} />,
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
        ? t("course.history.groupOrga.added", "{GROUP} got added as orga-group by {USER}", tOptions)
        : t(
            "course.history.groupOrga.removed",
            "{GROUP} got removed as orga-group by {USER}",
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
      <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>{" "}
      {t("course.history.eventInserted", "{EVENT} created by {USER}", {
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
      <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>{" "}
      {replicasUpdated
        ? t(
            "course.history.eventAndRepeatsUpdated",
            "{EVENT} and repeats updated by {USER}",
            tOptions,
          )
        : t("course.history.eventUpdated", "{EVENT} updated by {USER}", tOptions)}
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
      <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>{" "}
      {t("course.history.eventRemoved", "{EVENT} removed by {USER}", {
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
      {t("course.history.updated", "Updated by {USER}", {
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

export function CreatedHistoryEntry({ createdby }: CourseModel) {
  const { t } = useTranslation();
  return (
    <>
      {t("course.history.created_by", "Created by {USER}", {
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
  groupPromote: GroupPromoteHistoryEntry,
  groupOrga: GroupOrgaHistoryEntry,
  eventInserted: EventInsertedHistoryEntry,
  eventUpdated: EventUpdatedHistoryEntry,
  eventRemoved: EventRemovedHistoryEntry,
} as const;

export function History({ course }: { course: CourseModel }) {
  const user = useUser();

  function pastEventsList() {
    const historyEntries: { dateTime: Date | undefined; template: React.FC<any>; data: object }[] =
      [];

    const history =
      user && course.editableBy(user)
        ? course.history
        : course.history?.filter((e) => e.type !== "groupPromote" && e.type !== "groupOrga");

    // add past events
    historyEntries.push(
      ...Events.find(
        { courseId: course._id, start: { $lt: new Date() } },
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
        data: e.data,
      })) || []),
    );

    // and with the course creation
    historyEntries.push({
      dateTime: course.time_created,
      template: CreatedHistoryEntry,
      data: course,
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
      {pastEventsList().map((event, index) => {
        return (
          <div className="row" key={index}>
            <div className="timeline-eventdate col-3" title={dateLong(event.dateTime)}>
              {fromNow(event.dateTime)}
            </div>
            <div className="timeline-eventline-container col-1">
              <div className="timeline-eventline">
                <div className="timeline-eventpoint"></div>
              </div>
            </div>
            <div className="coursehistory-event col-8">
              <event.template {...event.data} />
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
