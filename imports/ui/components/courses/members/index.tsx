import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { CourseModel } from "/imports/api/courses/courses";

import { Member } from "./member";

import "./styles.scss";

export function Members({ course }: { course: CourseModel }) {
  const { t } = useTranslation();
  const user = useUser();

  const increaseBy = 10;
  const [membersDisplayLimit, setMembersDisplayLimit] = useState(increaseBy);

  function howManyEnrolled() {
    if (!course) {
      return undefined;
    }
    return course.members.length;
  }
  function canNotifyAll() {
    if (user?.privileged("admin")) {
      return true;
    }

    return !!(
      course?.userHasRole(user?._id, "team") ||
      user?.groups.some((g) => course?.groupOrganizers.includes(g))
    );
  }
  function sortedMembers() {
    if (!course) {
      return undefined;
    }
    const { members } = course;
    members.sort((a, b) => {
      const aRoles = a.roles.filter((role) => role !== "participant");
      const bRoles = b.roles.filter((role) => role !== "participant");
      return bRoles.length - aRoles.length;
    });
    // check if logged-in user is in members and if so put him on top
    const userId = user?._id;
    if (userId && members.some((member) => member.user === userId)) {
      const userArrayPosition = members.findIndex((member) => member.user === userId);
      const currentMember = members[userArrayPosition];
      // remove current user form array and readd him at index 0
      members.splice(userArrayPosition, 1); // remove
      members.splice(0, 0, currentMember); // readd
    }
    return members.slice(0, membersDisplayLimit);
  }
  function limited() {
    return (course?.members.length || 0) > membersDisplayLimit;
  }

  function handleContactMembersClick() {
    document.getElementById("discussion")?.dispatchEvent(new Event("notifyAll"));
  }

  function handleShowMoreMembersClick() {
    setMembersDisplayLimit(membersDisplayLimit + increaseBy);
  }

  return (
    <>
      <div className="page-component-header">
        <h4>
          <i className="fa-solid fa-users fa-fw" />
          &nbsp;
          {t(
            "course.details.members.title",
            "{NUM, plural, =0{No interested yet} one{1 interested} other{# interested} }",
            { NUM: howManyEnrolled() },
          )}{" "}
          {canNotifyAll() && (
            <i
              className="fa-solid fa-envelope contact-members"
              onClick={handleContactMembersClick}
            />
          )}
        </h4>
      </div>
      {!!course?.members && (
        <div className="course-members">
          {sortedMembers()?.map((member) => (
            <Member key={member.user} member={member} course={course} />
          ))}
          {limited() && (
            <button
              className="btn btn-add page-component-btn"
              type="button"
              onClick={handleShowMoreMembersClick}
            >
              {t("_button.more")}
            </button>
          )}
        </div>
      )}
    </>
  );
}
