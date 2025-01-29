import React from "react";
import { useTranslation } from "react-i18next";

import { CourseModel } from "/imports/api/courses/courses";

import { hasRole, hasRoleUser } from "/imports/utils/course-role-utils";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useRoleDisplay } from "../../../../lib/useRoleDisplay";

import "./styles.scss";

export type Props = { course: CourseModel };

export function CourseCompactRoles({ course }: Props) {
  const userId = useUserId();
  const { t } = useTranslation();
  const { roleIcon } = useRoleDisplay();

  function requiresRole(role: string) {
    return course.roles.includes(role);
  }

  function participantClass() {
    let className = "course-compact-role-";

    const { members } = course;
    if (hasRoleUser(members, "participant", userId)) {
      className += "occupied-by-user";
    } else if (members.length) {
      className += "occupied";
    } else {
      className += "needed";
    }

    return className;
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
        data-bs-toggle="tooltip"
        data-bs-title={`${roleStateTooltip("team")}`}
      >
        <i className={`${roleIcon("team")}`} aria-hidden="true"></i>
      </div>
      {requiresRole("mentor") ? (
        <div
          className={`course-compact-role ${roleStateClass("mentor")}`}
          data-bs-toggle="tooltip"
          data-bs-title={`${roleStateTooltip("mentor")}`}
        >
          <i className={`${roleIcon("mentor")}`} aria-hidden="true"></i>
        </div>
      ) : null}
      {requiresRole("host") ? (
        <div
          className={`course-compact-role ${roleStateClass("host")}`}
          data-bs-toggle="tooltip"
          data-bs-title={`${roleStateTooltip("host")}`}
        >
          <i className={`${roleIcon("host")}`} aria-hidden="true"></i>
        </div>
      ) : null}
      <div
        className={`course-compact-role ${participantClass()}`}
        data-bs-toggle="tooltip"
        data-bs-title={`${participantTooltip()}`}
      >
        <i className={`${roleIcon("participant")}`} aria-hidden="true"></i>&nbsp;
        {course.members.length}
      </div>
    </div>
  );
}
