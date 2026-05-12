import React from "react";
import { useTranslation } from "react-i18next";
import { uniqBy } from "lodash-es";

import { UserModel } from "/imports/api/users/users";
import { useFindFilter } from "/imports/api/groups/publications";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { RoleEntity } from "/imports/utils/PublicSettings";

import { ScssVars } from "/imports/ui/lib/scss-vars";
import { LoadingPage } from "/imports/ui/pages/loading";
import { GroupList } from "/imports/ui/components/groups/List";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import "./styles.scss";

export function GroupListSection({ user, ownProfile }: { user: UserModel; ownProfile: boolean }) {
  const { t } = useTranslation();
  const [isLoadingRoles, roles] = useRegionRoles();
  const uniqRoles = uniqBy(roles, (r) => r.type);
  const { roleShort, roleMyList, roleUserList, roleMyListPast, roleUserListPast } =
    useRoleDisplay(roles);
  const id = user._id;

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

  function groupsByRoleCount(role: string, archived: boolean) {
    return groupsByRole(role, archived).length;
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
            {ownProfile
              ? t("users.grouplist.myGroups", "I am involved in the following groups")
              : t("users.grouplist.userGroups", "{NAME} is involved in the following groups", {
                  NAME: user.getDisplayName(),
                })}
          </h3>
          {isLoadingRoles() || isLoadingGroups() || isLoadingArchivedGroups() ? (
            <LoadingPage />
          ) : (
            <>
              <div>
                {uniqRoles
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
              {uniqRoles
                .filter((role) => groupsByRoleCount(role.type, false))
                .map((role) => (
                  <React.Fragment key={role.type}>
                    <h3 id={role.type}>
                      <div className="badge">
                        <i className={`${role.icon} fa-fw`} />
                      </div>{" "}
                      {ownProfile
                        ? roleMyList(role.type)
                        : roleUserList(role.type, user.getDisplayName())}
                    </h3>
                    <GroupList groups={groupsByRole(role.type, false)} small={true} />
                  </React.Fragment>
                ))}

              {uniqRoles
                .filter((role) => groupsByRoleCount(role.type, true) && showArchived(role))
                .map((role) => (
                  <React.Fragment key={role.type}>
                    <h3 id={`${role.type}_archived`}>
                      <div className="badge is-archived">
                        <i className={`${role.icon} fa-fw`} />
                      </div>{" "}
                      {ownProfile
                        ? roleMyListPast(role.type)
                        : roleUserListPast(role.type, user.getDisplayName())}
                    </h3>
                    <GroupList groups={groupsByRole(role.type, true)} small={true} />
                  </React.Fragment>
                ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
