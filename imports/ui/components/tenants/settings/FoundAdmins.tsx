import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import * as Alert from "/imports/api/alerts/alert";
import * as TenantsMethods from "/imports/api/tenants/methods";
import { TenantModel } from "/imports/api/tenants/tenants";
import * as UsersPublications from "/imports/api/users/publications";
import { UserModel } from "/imports/api/users/users";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

export function FoundAdmins({ tenant, userSearch }: { tenant: TenantModel; userSearch: string }) {
  const { t } = useTranslation();

  const [isLoading, foundAdmins] = UsersPublications.useFindFilter(userSearch, {
    exclude: tenant?.admins,
  });

  async function handleOnClick(user: UserModel) {
    routerAutoscroll.cancelNext();

    const adminId = user._id;
    try {
      await TenantsMethods.addAdmin(adminId, tenant._id);
      const adminName = user.getDisplayName();
      const tenantName = tenant.name;
      Alert.success(
        t(
          "tenantSettings.adminAdded",
          '"{ADMIN}" has been added as admin of the "{TENANT}" organization',
          { ADMIN: adminName, TENANT: tenantName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, t("tenantSettings.adminAdded.error", "Could not add admin"));
    }
  }

  if (isLoading() || !foundAdmins) {
    return null;
  }

  return (
    <div className="tag-group multiline">
      {foundAdmins.map((admin) => (
        <>
          <div className="tag tag-btn tenant-admin-tag-btn-add">
            <button
              data-test={`tenant-setting-admin-add-button-${admin.getDisplayName()}`}
              title={t("tenant.settings.addAdmin", "add as admin")}
              type="button"
              onClick={() => {
                handleOnClick(admin);
              }}
            >
              <i className="fa-solid fa-plus fa-fw" aria-hidden="true" /> {admin.getDisplayName()}
            </button>
          </div>
          <div className="tag tag-link tenant-admin-tag-profile addon">
            <a href={Router.path("userprofile", admin)} title={t("tenant.settings.admin.profile")}>
              <i className="fa-solid fa-user fa-fw" aria-hidden="true" />
            </a>
          </div>
        </>
      ))}
    </div>
  );
}
