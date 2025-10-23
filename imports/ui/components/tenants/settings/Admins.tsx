import { Router } from "meteor/iron:router";
import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import { useTranslation } from "react-i18next";
import * as Alert from "/imports/api/alerts/alert";
import * as TenantsMethods from "/imports/api/tenants/methods";
import { TenantModel } from "/imports/api/tenants/tenants";
import { getUserName } from "/imports/ui/lib/getUserName";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

function Admin({ tenant, adminId }: { tenant: TenantModel; adminId: string }) {
  const { t } = useTranslation();

  const userName = useTracker(() => getUserName(adminId));

  async function handleOnClick() {
    routerAutoscroll.cancelNext();

    try {
      await TenantsMethods.removeAdmin(adminId, tenant._id);

      const adminName = userName;
      const tenantName = tenant.name;
      Alert.success(
        t(
          "tenantSettings.adminRemoved",
          '"{ADMIN}" has been removed as admin of the "{TENANT}" organization',
          { ADMIN: adminName, TENANT: tenantName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, t("tenantSettings.adminRemoved.error", "Could not remove admin"));
    }
  }

  return (
    <>
      <div className="tag tag-btn tenant-admin-tag-btn-remove">
        <button
          data-test={`tenant-setting-admin-remove-button-${userName}`}
          title={t("tenant.settings.removeAdminFromTenant", "remove admin")}
          type="button"
          onClick={() => {
            handleOnClick();
          }}
        >
          <i className="fa-solid fa-xmark fa-fw" aria-hidden="true" /> {userName}
        </button>
      </div>
      <div className="tag tag-link tenant-admin-tag-profile addon">
        <a
          href={Router.path("userprofile", { _id: adminId })}
          title={t("tenant.settings.admin.profile", "Visit profile")}
        >
          <i className="fa-solid fa-user fa-fw" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}

export function Admins({ tenant }: { tenant: TenantModel }) {
  return (
    <div className="tag-group multiline">
      {tenant.admins.map((admin) => (
        <Admin key={admin} tenant={tenant} adminId={admin} />
      ))}
    </div>
  );
}
