import React from "react";
import { useTranslation } from "react-i18next";

import { UserModel } from "/imports/api/users/users";
import { useFindFilter } from "/imports/api/groups/publications";

import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { RoleEntity } from "/imports/utils/PublicSettings";
import { isPredefined } from "/imports/api/groups/lib/isRole";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useRegionRoles } from "/imports/ui/hooks/useRegionRoles";
import { predefinedRole, SystemRoles } from "/imports/api/groups/lib/Role";

import { GroupList } from "/imports/ui/components/groups/List";
import { LoadingPage } from "/imports/ui/pages/loading";
import { RoleIcon } from "/imports/ui/components/RoleIcon";

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
  const [isLoadingRegionRoles, regionRoles, region] = useRegionRoles(regionId);

  const {
    roleShort,
    roleProfileMyGroupListCurrent,
    roleProfileUserGroupListCurrent,
    roleProfileMyGroupListPast,
    roleProfileUserGroupListPast,
  } = useRoleDisplay(regionRoles);
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

  if (isLoadingRegionRoles()) {
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
          {isLoadingGroups() || isLoadingArchivedGroups() ? (
            <LoadingPage />
          ) : (
            <>
              <div>
                {regionRoles
                  .filter((regionRole) => groupsByRoleCount(regionRole.id, false))
                  .map((regionRole) => {
                    const role = predefinedRole(regionRole.id);
                    return (
                      <React.Fragment key={role.id}>
                        <a
                          className="badge role-label"
                          href={`#section-${region?._id}-${role.id}`}
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
                          <RoleIcon role={role} regionRoles={regionRoles} /> {roleShort(role)}{" "}
                          <i className="fa-solid fa-arrow-down fa-fw" />
                          {groupsByRoleCount(role.id, false)}
                        </a>{" "}
                      </React.Fragment>
                    );
                  })}
              </div>
              {regionRoles
                .filter((regionRole) => groupsByRoleCount(regionRole.id, false))
                .map((regionRole) => {
                  const role = predefinedRole(regionRole.id);
                  return (
                    <React.Fragment key={role.id}>
                      <h3 id={`section-${region?._id}-${role.id}`}>
                        <div className="badge">
                          <RoleIcon role={role} regionRoles={regionRoles} />
                        </div>{" "}
                        {ownProfile
                          ? roleProfileMyGroupListCurrent(role)
                          : roleProfileUserGroupListCurrent(role, user.getDisplayName())}
                      </h3>
                      <GroupList groups={groupsByRole(role.id, false)} small={true} />
                    </React.Fragment>
                  );
                })}

              {regionRoles
                .filter(
                  (regionRole) =>
                    groupsByRoleCount(regionRole.id, true) && showArchived(regionRole),
                )
                .map((regionRole) => {
                  const role = predefinedRole(regionRole.id);
                  return (
                    <React.Fragment key={role.id}>
                      <h3 id={`section-${region?._id}-${role.id}-archived`}>
                        <div className="badge is-archived">
                          <RoleIcon role={role} regionRoles={regionRoles} />
                        </div>{" "}
                        {ownProfile
                          ? roleProfileMyGroupListPast(role)
                          : roleProfileUserGroupListPast(role, user.getDisplayName())}
                      </h3>
                      <GroupList groups={groupsByRole(role.id, true)} small={true} />
                    </React.Fragment>
                  );
                })}
            </>
          )}
        </>
      </div>
    )
  );
}
