import React from "react";
import { useTranslation } from "react-i18next";

import { RoleEntity, Roles } from "/imports/api/roles/roles";
import { UserModel } from "/imports/api/users/users";

import { ScssVars } from "/imports/ui/lib/scss-vars";

import { useFindFilter } from "/imports/api/courses/publications";
import { LoadingPage } from "/imports/ui/pages/loading";
import { CourseList } from "/imports/ui/components/courses/list";
import { useRoleDisplay } from "../../../lib/useRoleDisplay";

import "./styles.scss";

export function Courselist(data: { user: UserModel; ownProfile: boolean }) {
  const { t } = useTranslation();
  const { roleShort } = useRoleDisplay();
  const id = data.user._id;

  const [isLoadingCourses, courses] = useFindFilter({
    userInvolved: id,
    archived: false,
  });

  const [isLoadingArchivedCourses, archivedCourses] = useFindFilter({
    userInvolved: id,
    archived: true,
  });

  function coursesByRole(role: string, archived: boolean) {
    return (!archived ? courses : archivedCourses).filter((c) =>
      c.members.find((m) => m.user === id && m.roles.includes(role)),
    );
  }
  function roles() {
    return Roles.slice().reverse();
  }
  function coursesByRoleCount(role: string, archived: boolean) {
    return coursesByRole(role, archived).length;
  }
  function roleUserList(role: string) {
    return `roles.${role}.userList`;
  }
  function roleUserListPast(role: string) {
    return `roles.${role}.userList.past`;
  }
  function roleMyList(role: string) {
    return `roles.${role}.myList`;
  }
  function roleMyListPast(role: string) {
    return `roles.${role}.myList.past`;
  }
  function isInvolved() {
    return courses.length > 0 || archivedCourses.length > 0;
  }
  function showArchived(role: RoleEntity) {
    return role.type === "team";
  }

  return (
    <div className="page-component page-component-seperated profile-courselist">
      {isInvolved() && (
        <>
          <h3 className="badge-title">
            {data.ownProfile
              ? t("users.courselist.myCourses", "I am involved in the following courses")
              : t("users.courselist.userCourses", "{NAME} is involved in the following courses", {
                  NAME: data.user.getDisplayName(),
                })}
          </h3>
          {!isLoadingCourses() && !isLoadingArchivedCourses() ? (
            <>
              <div>
                {roles()
                  .filter((role) => coursesByRoleCount(role.type, false))
                  .map((role) => (
                    <React.Fragment key={role.type}>
                      <a
                        className="badge role-label"
                        href={`#${role.type}`}
                        onClick={(event) => {
                          event.preventDefault();
                          const roleLabel = event.currentTarget;
                          const rolePosition =
                            $(roleLabel.getAttribute("href") || "").offset()?.top || 0;
                          // subtract the amount of pixels of the height of the navbar
                          $("html, body").animate({
                            scrollTop: rolePosition - ScssVars.navbarHeight,
                          });
                        }}
                      >
                        <span className={`${role.icon} fa-fw`} aria-hidden="true"></span>{" "}
                        {roleShort(role.type)}
                        <span className="fa-solid fa-arrow-down fa-fw" aria-hidden="true"></span>
                        {coursesByRoleCount(role.type, false)}
                      </a>{" "}
                    </React.Fragment>
                  ))}
              </div>
              {roles()
                .filter((role) => coursesByRoleCount(role.type, false))
                .map((role) => (
                  <React.Fragment key={role.type}>
                    <h3 id={role.type}>
                      <div className="badge">
                        <span className={`${role.icon} fa-fw`} aria-hidden="true"></span>
                      </div>{" "}
                      {data.ownProfile
                        ? t(roleMyList(role.type))
                        : t(roleUserList(role.type), {
                            NAME: data.user.getDisplayName(),
                          })}
                    </h3>
                    <CourseList courses={coursesByRole(role.type, false)} small={true} />
                  </React.Fragment>
                ))}

              {roles()
                .filter((role) => coursesByRoleCount(role.type, true) && showArchived(role))
                .map((role) => (
                  <React.Fragment key={role.type}>
                    <h3 id={`${role.type}_archived`}>
                      <div className="badge is-archived">
                        <span className={`${role.icon} fa-fw`} aria-hidden="true"></span>
                      </div>{" "}
                      {data.ownProfile
                        ? t(roleMyListPast(role.type))
                        : t(roleUserListPast(role.type), {
                            NAME: data.user.getDisplayName(),
                          })}
                    </h3>
                    <CourseList courses={coursesByRole(role.type, true)} small={true} />
                  </React.Fragment>
                ))}
            </>
          ) : (
            <LoadingPage />
          )}
        </>
      )}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("UsersCourselist", () => CourseList);
