import { useTranslation } from "react-i18next";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import { GroupModel } from "/imports/api/groups/groups";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { OrganizationTag } from "../../../organizations/tag";
import { Add } from "./Add";
import { Remove } from "./Remove";
import { RemoveTeam } from "./RemoveTeam";
import { MakeTeam } from "./MakeTeam";
import { difference } from "es-toolkit";
import { cx } from "/imports/utils/cx";

export interface Props {
  group: GroupModel;
}

function Tools({ organizationId, group }: { organizationId: string; group: GroupModel }) {
  const user = useUser();

  return (
    <>
      {(!!user?.canPromoteWith(organizationId) || group.editableBy(user)) && (
        <li className="dialog-dropdown-btn">
          <Remove group={group} organizationId={organizationId} />
        </li>
      )}
      {group.editableBy(user) && (
        <li className="dialog-dropdown-btn">
          {group.teamOrganizations.includes(organizationId) ? (
            <RemoveTeam group={group} organizationId={organizationId} />
          ) : (
            <MakeTeam group={group} organizationId={organizationId} />
          )}
        </li>
      )}
    </>
  );
}

export function OrganizationList({ group }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(group.region);

  if (isRegionLoading()) {
    return null;
  }

  const organizations = group.organizations.filter(
    (organizationId) =>
      !(
        // hide organization where are from the region set
        (
          region?.defaultTeamOrganizations?.includes(organizationId) &&
          // when user ist not member of the organization or a admin
          !user?.canPromoteWith(organizationId) &&
          !group.editableBy(user)
        )
      ),
  );

  const supportedBy = organizations.filter((o) => group.teamOrganizations.includes(o));
  const featuredBy = organizations.filter((o) => !group.teamOrganizations.includes(o));
  const organizationsToAdd = user && difference(user.organizations, group.organizations);

  return (
    <div className="tag-group multiline">
      {supportedBy.length > 0 && (
        <>
          <div className="tag">{t("group.organizationList.supportedBy", "Supported by:")}</div>
          {supportedBy.map((organizationId) => {
            return (
              <div key={organizationId} className="tag-group-addon-unit">
                <OrganizationTag organizationId={organizationId} isTeam />

                <div className="tag organization-tag addon">
                  <i
                    className="fa-solid fa-bullhorn fa-fw"
                    title={t(
                      "group.organizationList.title.organizedBy",
                      "{GROUP} is co-organized by this organization",
                      {
                        GROUP: group.name,
                      },
                    )}
                  />
                </div>

                {(!!user?.canPromoteWith(organizationId) || group.editableBy(user)) && (
                  <div className="btn-group tag-btn organization-tag-btn addon align-top">
                    <button
                      type="button"
                      className="dropdown-toggle"
                      aria-expanded="false"
                      aria-haspopup="true"
                      data-bs-toggle="dropdown"
                      aria-label={t("_button.open")}
                    />
                    <ul className="dropdown-menu dialog-dropdown">
                      <li className="dropdown-header">
                        {t(
                          "group.organizationList.dropdownTitle.editOrganization",
                          "Edit organization",
                        )}
                        <button
                          type="button"
                          className="btn-close"
                          aria-label={t("_button.close")}
                        />
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <Tools organizationId={organizationId} group={group} />
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {(!!organizationsToAdd?.length || featuredBy.length > 0) && (
        <>
          <div className={cx("tag", supportedBy.length > 0 && "ms-4")}>
            {t("group.organizationList.featuredBy", "Featured by:")}
          </div>
          {featuredBy.map((organizationId) => {
            return (
              <div key={organizationId} className="tag-group-addon-unit">
                <OrganizationTag organizationId={organizationId} />

                {(!!user?.canPromoteWith(organizationId) || group.editableBy(user)) && (
                  <div className="btn-group tag-btn organization-tag-btn addon align-top">
                    <button
                      type="button"
                      className="dropdown-toggle"
                      aria-expanded="false"
                      aria-haspopup="true"
                      data-bs-toggle="dropdown"
                      aria-label={t("_button.open")}
                    />
                    <ul className="dropdown-menu dialog-dropdown">
                      <li className="dropdown-header">
                        {t(
                          "group.organizationList.dropdownTitle.editOrganization",
                          "Edit organization",
                        )}
                        <button
                          type="button"
                          className="btn-close"
                          aria-label={t("_button.close")}
                        />
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <Tools organizationId={organizationId} group={group} />
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {!!organizationsToAdd?.length && (
            <Add group={group} organizationsToAdd={organizationsToAdd} />
          )}
        </>
      )}
    </div>
  );
}
