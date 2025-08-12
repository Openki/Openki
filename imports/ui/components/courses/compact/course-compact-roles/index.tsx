import React from "react";
import { useTranslation } from "react-i18next";

import { CourseModel } from "/imports/api/courses/courses";

import { hasRole, hasRoleUser } from "/imports/utils/course-role-utils";
import { useUserId } from "/imports/utils/react-meteor-data";

import { RoleIcon } from "/imports/ui/RoleIcon";

import "./styles.scss";

export interface Props {
  course: CourseModel;
}

export function CourseCompactRoles({ course }: Props) {
  const userId = useUserId();
  const { t } = useTranslation();

  function participantClass() {
    const { members } = course;

    if (hasRoleUser(members, "participant", userId)) {
      return "course-compact-role-occupied-by-user";
    }

    if (members.length) {
      return "course-compact-role-occupied";
    }

    return "course-compact-role-needed";
  }

  function participantTooltip() {
    let tooltip;
    const numMembers = course.interested;
    const isParticipant = hasRoleUser(course.members, "participant", userId);

    if (numMembers === 1 && isParticipant) {
      tooltip = t("course.compact.youAreInterested", "You are interested");
    } else {
      tooltip = t(
        "course.compact.interestedCount",
        "{NUM, plural, =0{Nobody is} one{One person is} other{# persons are} } interested",
        { NUM: numMembers },
      );

      if (numMembers > 1 && isParticipant) {
        tooltip += " ";
        tooltip += t("course.compact.interestedCountOwn", "and you are one of them");
      }
    }

    return tooltip;
  }

  function roleStateClass(role: string) {
    let className = "course-compact-role-";
    if (!hasRole(course.members, role)) {
      className += "needed";
    } else if (hasRoleUser(course.members, role, userId)) {
      className += "occupied-by-user";
    } else {
      className += "occupied";
    }

    return className;
  }

  function roleStateTooltip(role: "team" | "mentor" | "host") {
    let tooltip;

    const tooltips = {
      team: {
        needed: t("course.list.status_titles.needs_organizer", "Needs an organizer"),
        occupied: t("course.list.status_titles.has_team", "Has an organizer-team"),
        occupiedByUser: t("course.list.status_titles.u_are_organizer", "You are organizer"),
      },
      mentor: {
        needed: t("course.list.status_titles.needs_mentor", "Needs a mentor"),
        occupied: t("course.list.status_titles.has_mentor", "Has a mentor"),
        occupiedByUser: t("course.list.status_titles.u_are_mentor", "You are mentor"),
      },
      host: {
        needed: t("course.list.status_titles.needs_host", "Needs a host"),
        occupied: t("course.list.status_titles.has_host", "Has a host"),
        occupiedByUser: t("course.list.status_titles.u_are_host", "You are host"),
      },
    };

    if (!hasRole(course.members, role)) {
      tooltip = tooltips[role].needed;
    } else if (hasRoleUser(course.members, role, userId)) {
      tooltip = tooltips[role].occupiedByUser;
    } else {
      tooltip = tooltips[role].occupied;
    }

    return tooltip;
  }

  return (
    <div className="course-compact-roles col">
      <div
        className={`course-compact-role ${roleStateClass("team")}`}
        data-bs-title={`${roleStateTooltip("team")}`}
      >
        <RoleIcon type="team" />
      </div>
      {course.roles.includes("mentor") && (
        <div
          className={`course-compact-role ${roleStateClass("mentor")}`}
          data-bs-title={`${roleStateTooltip("mentor")}`}
        >
          <RoleIcon type="mentor" />
        </div>
      )}
      {course.roles.includes("host") && (
        <div
          className={`course-compact-role ${roleStateClass("host")}`}
          data-bs-title={`${roleStateTooltip("host")}`}
        >
          <RoleIcon type="host" />
        </div>
      )}
      {course.roles.includes("participant") && (
        <div
          className={`course-compact-role ${participantClass()}`}
          data-bs-title={`${participantTooltip()}`}
        >
          <RoleIcon type="participant" />
          &nbsp;
          {course.members.filter((m) => m.roles.includes("participant")).length}
        </div>
      )}
    </div>
  );
}
