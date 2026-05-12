import { Router } from "meteor/iron:router";
import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import { useTranslation } from "react-i18next";
import * as Alert from "/imports/api/alerts/alert";
import * as TenantsMethods from "/imports/api/tenants/methods";
import { TenantModel } from "/imports/api/tenants/tenants";
import { getUserName } from "/imports/ui/lib/getUserName";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

function Member({ tenant, memberId }: { tenant: TenantModel; memberId: string }) {
  const { t } = useTranslation();

  const userName = useTracker(() => getUserName(memberId));

  async function handleOnClick() {
    routerAutoscroll.cancelNext();

    try {
      await TenantsMethods.removeMember(memberId, tenant._id);

      const memberName = userName;
      const tenantName = tenant.name;
      Alert.success(
        t("tenantSettings.memberRemoved", '"{MEMBER}" has been removed from {TENANT}', {
          MEMBER: memberName,
          TENANT: tenantName,
        }),
      );
    } catch (err) {
      Alert.serverError(err, t("tenantSettings.memberRemoved.error", "Could not remove member"));
    }
  }

  return (
    <>
      <div className="tag tag-btn tenant-member-tag-btn-remove">
        <button
          data-test={`tenant-setting-member-remove-button-${userName}`}
          title={t("tenant.settings.removeFromTenant", "remove member")}
          type="button"
          onClick={() => {
            handleOnClick();
          }}
        >
          <i className="fa-solid fa-xmark fa-fw" /> {userName}
        </button>
      </div>
      <div className="tag tag-link tenant-member-tag-profile addon">
        <a
          href={Router.path("userprofile", { _id: memberId })}
          title={t("tenant.settings.member.profile", "Visit profile")}
        >
          <i className="fa-solid fa-user fa-fw" />
        </a>
      </div>
    </>
  );
}

export function Members({ tenant }: { tenant: TenantModel }) {
  function members() {
    return tenant.members.filter((m) => !tenant.admins.includes(m)) || [];
  }

  return (
    <div className="tag-group multiline">
      {members().map((member) => (
        <div key={member} className="tag-group-addon-unit">
          <Member tenant={tenant} memberId={member} />
        </div>
      ))}
    </div>
  );
}
