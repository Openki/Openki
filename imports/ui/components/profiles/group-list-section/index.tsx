import React from "react";
import { useTranslation } from "react-i18next";

import { UserModel } from "/imports/api/users/users";
import { useFindFilter } from "/imports/api/groups/publications";
import { useDetails } from "/imports/api/regions/publications";

import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { RoleEntity } from "/imports/utils/PublicSettings";
import { isPredefined } from "/imports/api/groups/lib/isRole";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { cx } from "/imports/utils/cx";
import { predefinedRole, SystemRoles } from "/imports/api/groups/lib/Role";

import { GroupList } from "/imports/ui/components/groups/List";
import { LoadingPage } from "/imports/ui/pages/loading";

import "./styles.scss";

export function GroupListSection({
  regionId,
  user,
  ownProfile,
}: {
  regionId: string;
  user: UserModel;
  ownProfile: boolean;
}) {
  const { t } = useTranslation();
  const [isLoadingRegion, region] = useDetails(regionId);
  const [isLoadingRoles, roles] = useRegionRoles(regionId);

  const {
    roleShort,
    roleProfileMyGroupListCurrent,
    roleProfileUserGroupListCurrent,
    roleProfileMyGroupListPast,
    roleProfileUserGroupListPast,
  } = useRoleDisplay(roles);
  const id = user._id;

  const [isLoadingGroups, groups] = useFindFilter({
    region: regionId,
    userInvolved: id,
    archived: false,
  });

  const [isLoadingArchivedGroups, archivedGroups] = useFindFilter({
    region: regionId,
    userInvolved: id,
    archived: true,
  });

  function groupsByRole(role: string, archived: boolean) {
    return (!archived ? groups : archivedGroups).filter((g) =>
      g.members.find((m) => m.user === id && m.roles.some((r) => r.id === role && isPredefined(r))),
    );
  }

  function groupsByRoleCount(role: string, archived: boolean) {
    return groupsByRole(role, archived).length;
  }
  function isInvolved() {
    return groups.length > 0 || archivedGroups.length > 0;
  }
  function showArchived(role: RoleEntity) {
    return role.id === SystemRoles.Team.id;
  }

  if (isLoadingRegion()) {
    return null;
  }

  return (
    isInvolved() && (
      <div className="page-component page-component-seperated profile-grouplist">
        <>
          <h2>{region?.name}</h2>
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
                {roles
                  .filter((role) => groupsByRoleCount(role.id, false))
                  .map((role) => (
                    <React.Fragment key={role.id}>
                      <a
                        className="badge role-label"
                        href={`#${role.id}`}
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
                        <i className={cx(role.icon, "fa-fw")} />{" "}
                        {roleShort(predefinedRole(role.id))}{" "}
                        <i className="fa-solid fa-arrow-down fa-fw" />
                        {groupsByRoleCount(role.id, false)}
                      </a>{" "}
                    </React.Fragment>
                  ))}
              </div>
              {roles
                .filter((role) => groupsByRoleCount(role.id, false))
                .map((role) => (
                  <React.Fragment key={role.id}>
                    <h3 id={role.id}>
                      <div className="badge">
                        <i className={cx(role.icon, "fa-fw")} />
                      </div>{" "}
                      {ownProfile
                        ? roleProfileMyGroupListCurrent(predefinedRole(role.id))
                        : roleProfileUserGroupListCurrent(
                            predefinedRole(role.id),
                            user.getDisplayName(),
                          )}
                    </h3>
                    <GroupList groups={groupsByRole(role.id, false)} small={true} />
                  </React.Fragment>
                ))}

              {roles
                .filter((role) => groupsByRoleCount(role.id, true) && showArchived(role))
                .map((role) => (
                  <React.Fragment key={role.id}>
                    <h3 id={`${role.id}_archived`}>
                      <div className="badge is-archived">
                        <i className={cx(role.icon, "fa-fw")} />
                      </div>{" "}
                      {ownProfile
                        ? roleProfileMyGroupListPast(predefinedRole(role.id))
                        : roleProfileUserGroupListPast(
                            predefinedRole(role.id),
                            user.getDisplayName(),
                          )}
                    </h3>
                    <GroupList groups={groupsByRole(role.id, true)} small={true} />
                  </React.Fragment>
                ))}
            </>
          )}
        </>
      </div>
    )
  );
}
