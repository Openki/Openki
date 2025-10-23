import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import * as Alert from "/imports/api/alerts/alert";
import * as TenantsMethods from "/imports/api/tenants/methods";
import { TenantModel } from "/imports/api/tenants/tenants";
import * as UsersPublications from "/imports/api/users/publications";
import { UserModel } from "/imports/api/users/users";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

export function FoundMembers({ tenant, userSearch }: { tenant: TenantModel; userSearch: string }) {
  const { t } = useTranslation();

  const [isLoading, foundMembers] = UsersPublications.useFindFilter(userSearch, {
    exclude: tenant.members,
  });

  async function handleOnClick(user: UserModel) {
    routerAutoscroll.cancelNext();

    const memberId = user._id;
    try {
      await TenantsMethods.addMember(memberId, tenant._id);
      const memberName = user.getDisplayName();
      const tenantName = tenant.name;
      Alert.success(
        t(
          "tenantSettings.memberAdded",
          '"{MEMBER}" has been added to the "{TENANT}" organization',
          { MEMBER: memberName, TENANT: tenantName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, t("tenantSettings.memberAdded.error", "Could not add member"));
    }
  }

  if (isLoading() || !foundMembers) {
    return null;
  }

  return (
    <div className="tag-group multiline">
      {foundMembers.map((member) => (
        <React.Fragment key={member._id}>
          <div className="tag tag-btn tenant-member-tag-btn-add">
            <button
              data-test={`tenant-setting-member-add-button-${member.getDisplayName()}`}
              title={t("tenant.settings.addMember", "add as member")}
              type="button"
              onClick={() => {
                handleOnClick(member);
              }}
            >
              <i className="fa-solid fa-plus fa-fw" aria-hidden="true" /> {member.getDisplayName()}
            </button>
          </div>
          <div className="tag tag-link tenant-member-tag-profile addon">
            <a
              href={Router.path("userprofile", member)}
              title={t("tenant.settings.member.profile")}
            >
              <i className="fa-solid fa-user fa-fw" aria-hidden="true" />
            </a>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
