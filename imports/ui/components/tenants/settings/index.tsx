import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useParams } from "/imports/utils/react-meteor-router";

import * as Alert from "/imports/api/alerts/alert";
import { TenantModel, Tenants } from "/imports/api/tenants/tenants";
import { UserModel, Users } from "/imports/api/users/users";
import * as TenantsMethods from "/imports/api/tenants/methods";
import * as TenantsPublications from "/imports/api/tenants/publications";
import * as UsersPublications from "/imports/api/users/publications";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { useSiteName } from "/imports/utils/getSiteName";

import { JoinLink } from "../../joinLink";
import { Invitations } from "../../invitations";
import { NotFound } from "/imports/ui/pages/not-found";
import { UserName } from "/imports/ui/components/UserName";

import "./styles.scss";

template.events({
  async "click .js-member-remove-btn"(this: UserModel) {
    routerAutoscroll.cancelNext();

    const memberId = `${this}`;
    const tenantId = Router.current().params._id as string;
    try {
      await TenantsMethods.removeMember(memberId, tenantId);

      const memberName = Users.findOne(memberId)?.getDisplayName();
      const tenantName = Tenants.findOne(tenantId)?.name;
      Alert.success(
        i18n(
          "tenantSettings.memberRemoved",
          '"{MEMBER}" has been removed from the "{TENANT}" organization',
          { MEMBER: memberName, TENANT: tenantName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, i18n("tenantSettings.memberRemoved.error", "Could not remove member"));
    }
  },

  async "click .js-admin-remove-btn"(this: UserModel) {
    routerAutoscroll.cancelNext();

    const adminId = `${this}`;
    const tenantId = Router.current().params._id as string;
    try {
      await TenantsMethods.removeAdmin(adminId, tenantId);

      const adminName = Users.findOne(adminId)?.getDisplayName();
      const tenantName = Tenants.findOne(tenantId)?.name;
      Alert.success(
        i18n(
          "tenantSettings.adminRemoved",
          '"{ADMIN}" has been removed as admin of the "{TENANT}" organization',
          { ADMIN: adminName, TENANT: tenantName },
        ),
      );
    } catch (err) {
      Alert.serverError(err, i18n("tenantSettings.adminRemoved.error", "Could not remove admin"));
    }
  },
});

function FoundMembers({ tenant, userSearch }: { tenant: TenantModel; userSearch: string }) {
  const { t } = useTranslation();

  const [isLoading, foundMembers] = UsersPublications.useFindFilter(userSearch, {
    exclude: tenant?.members,
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
        <>
          <div className="tag tag-btn tenant-member-tag-btn-add">
            <button
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
        </>
      ))}
    </div>
  );
}

function FoundAdmins({ tenant, userSearch }: { tenant: TenantModel; userSearch: string }) {
  const { t } = useTranslation();

  const [isLoading, foundAdmins] = UsersPublications.useFindFilter(userSearch, {
    exclude: tenant?.members,
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
              className="js-admin-add-btn"
              title={t("tenant.settings.addMember", "add as member")}
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

export function Settings() {
  const { t } = useTranslation();
  const siteName = useSiteName();

  const params = useParams();

  const [memberSearch, setMemberSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const tenantId = params._id || "-1";

  const [isLoading, tenant] = TenantsPublications.useDetails(tenantId);

  function tenantName() {
    const tenant = Tenants.findOne(Router.current().params._id);
    return tenant?.name;
  }
  function members() {
    return tenant?.members.filter((m) => !tenant?.admins?.includes(m)) || [];
  }

  if (isLoading()) {
    return null;
  }

  if (!tenant) {
    return <NotFound />;
  }

  return (
    <div className="row">
      <div className="col-md">
        <h3>
          <span className="fa-solid fa-users fa-fw" aria-hidden="true" />{" "}
          {t("tenant.settings.title.Members", "Members")} ({members.length})
        </h3>
        <div className="icon-text-icon">
          <div className="icon-text-text">
            {t(
              "tenant.settings.members.description",
              "Members can see and use the above regions in the organisation {TENANT}.",
              { TENANT: tenantName },
            )}
          </div>
        </div>
        <br />
        <div className="tag-group multiline">
          {members().map((member) => (
            <>
              <div className="tag tag-btn tenant-member-tag-btn-remove">
                <button
                  className="js-member-remove-btn"
                  title={t("tenant.settings.removeFromTenant", "remove member")}
                  type="button"
                >
                  <i className="fa-solid fa-xmark fa-fw" aria-hidden="true" />{" "}
                  <UserName userId={member} />
                </button>
              </div>
              <div className="tag tag-link tenant-member-tag-profile addon">
                <a
                  href={Router.path("userprofile", { _id: member })}
                  title={t("tenant.settings.member.profile", "Visit profile")}
                >
                  <i className="fa-solid fa-user fa-fw" aria-hidden="true" />
                </a>
              </div>
            </>
          ))}
        </div>
        <div className="mb-3">
          <label className="form-label">
            {t(
              "tenant.settings.field.addMembers",
              'Add existing {SITENAME} members to your "{TENANTNAME}" organization.',
              { SITENAME: siteName, TENANTNAME: tenantName },
            )}
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <span className="fa-solid fa-user fa-fw" aria-hidden="true" />
            </span>
            <input
              className="form-control"
              id="AddTenantMember"
              placeholder={t("tenant.settings.field.addMember.placeholder", "Type name of buddy")}
              type="text"
              value={memberSearch}
              onChange={(event) => {
                setMemberSearch(event.currentTarget.value);
              }}
            />
          </div>
        </div>
        {memberSearch.length > 0 && <FoundMembers tenant={tenant} userSearch={memberSearch} />}
        <hr />
        <JoinLink tenant={tenant} />
        <hr />
        <Invitations tenant={tenant} />
      </div>
      <div className="col-md">
        <h3>
          <span className="fa-solid fa-users fa-fw" aria-hidden="true" />
          {t("tenant.settings.title.admin", "Admins")} ({tenant.admins.length})
        </h3>
        <div className="icon-text-text">
          {t(
            "tenant.settings.admin.description",
            "Admins are empowered to see and manage this panel here, like you.",
          )}
        </div>
        <br />
        <div className="tag-group multiline">
          {tenant.admins.map((admin) => (
            <>
              <div className="tag tag-btn tenant-admin-tag-btn-remove">
                <button
                  className="js-admin-remove-btn"
                  title={t("tenant.settings.removeAdminFromTenant", "remove admin")}
                  type="button"
                >
                  <i className="fa-solid fa-xmark fa-fw" aria-hidden="true" />
                  <UserName userId={admin} />
                </button>
              </div>
              <div className="tag tag-link tenant-admin-tag-profile addon">
                <a
                  href={Router.path("userprofile", { _id: admin })}
                  title={t("tenant.settings.admin.profile", "Visit profile")}
                >
                  <i className="fa-solid fa-user fa-fw" aria-hidden="true" />
                </a>
              </div>
            </>
          ))}
        </div>

        <div className="mb-3">
          <label className="form-label">
            {t(
              "tenant.settings.field.addAdmins",
              'Add an existing {SITENAME} user as a new admin to your "{TENANTNAME}" organization.',
              { SITENAME: siteName, TENANTNAME: tenantName },
            )}
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <span className="fa-solid fa-user fa-fw" aria-hidden="true" />
            </span>
            <input
              className="form-control"
              id="AddTenantAdmin"
              placeholder={t("tenant.settings.field.addAdmin.placeholder", "Type name of buddy")}
              type="text"
              value={adminSearch}
              onChange={(event) => {
                setAdminSearch(event.currentTarget.value);
              }}
            />
          </div>
        </div>
        {adminSearch.length > 0 && <FoundAdmins tenant={tenant} userSearch={adminSearch} />}
      </div>
    </div>
  );
}
