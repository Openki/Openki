import React from "react";
import { useTranslation } from "react-i18next";

import { RoleEntity, Roles } from "/imports/api/roles/roles";
import { UserModel } from "/imports/api/users/users";

import { ScssVars } from "/imports/ui/lib/scss-vars";

import { useFindFilter } from "../../../../api/groups/publications";
import { LoadingPage } from "/imports/ui/pages/loading";
import { GroupList } from "../../groups/List";
import { useRoleDisplay } from "../../../lib/useRoleDisplay";

import "./styles.scss";

export function GroupListSection(data: { user: UserModel; ownProfile: boolean }) {
  const { t } = useTranslation();
  const { roleShort } = useRoleDisplay();
  const id = data.user._id;

  const [isLoadingGroups, groups] = useFindFilter({
    userInvolved: id,
    archived: false,
  });

  const [isLoadingArchivedGroups, archivedGroups] = useFindFilter({
    userInvolved: id,
    archived: true,
  });

  function groupsByRole(role: string, archived: boolean) {
    return (!archived ? groups : archivedGroups).filter((g) =>
      g.members.find((m) => m.user === id && m.roles.includes(role)),
    );
  }
  function roles() {
    return Roles.slice().reverse();
  }
  function groupsByRoleCount(role: string, archived: boolean) {
    return groupsByRole(role, archived).length;
  }
  function roleUserList(role: string) {
    return `roles:${role}.userList`;
  }
  function roleUserListPast(role: string) {
    return `roles:${role}.userList.past`;
  }
  function roleMyList(role: string) {
    return `roles:${role}.myList`;
  }
  function roleMyListPast(role: string) {
    return `roles:${role}.myList.past`;
  }
  function isInvolved() {
    return groups.length > 0 || archivedGroups.length > 0;
  }
  function showArchived(role: RoleEntity) {
    return role.type === "team";
  }

  return (
    <div className="page-component page-component-seperated profile-grouplist">
      {isInvolved() && (
        <>
          <h3 className="badge-title">
            {data.ownProfile
              ? t("users.grouplist.myGroups", "I am involved in the following groups")
              : t("users.grouplist.userGroups", "{NAME} is involved in the following groups", {
                  NAME: data.user.getDisplayName(),
                })}
          </h3>
          {!isLoadingGroups() && !isLoadingArchivedGroups() ? (
            <>
              <div>
                {roles()
                  .filter((role) => groupsByRoleCount(role.type, false))
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
                        <i className={`${role.icon} fa-fw`} /> {roleShort(role.type)}
                        <i className="fa-solid fa-arrow-down fa-fw" />
                        {groupsByRoleCount(role.type, false)}
                      </a>{" "}
                    </React.Fragment>
                  ))}
              </div>
              {roles()
                .filter((role) => groupsByRoleCount(role.type, false))
                .map((role) => (
                  <React.Fragment key={role.type}>
                    <h3 id={role.type}>
                      <div className="badge">
                        <i className={`${role.icon} fa-fw`} />
                      </div>{" "}
                      {data.ownProfile
                        ? t(roleMyList(role.type))
                        : t(roleUserList(role.type), {
                            NAME: data.user.getDisplayName(),
                          })}
                    </h3>
                    <GroupList groups={groupsByRole(role.type, false)} small={true} />
                  </React.Fragment>
                ))}

              {roles()
                .filter((role) => groupsByRoleCount(role.type, true) && showArchived(role))
                .map((role) => (
                  <React.Fragment key={role.type}>
                    <h3 id={`${role.type}_archived`}>
                      <div className="badge is-archived">
                        <i className={`${role.icon} fa-fw`} />
                      </div>{" "}
                      {data.ownProfile
                        ? t(roleMyListPast(role.type))
                        : t(roleUserListPast(role.type), {
                            NAME: data.user.getDisplayName(),
                          })}
                    </h3>
                    <GroupList groups={groupsByRole(role.type, true)} small={true} />
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
