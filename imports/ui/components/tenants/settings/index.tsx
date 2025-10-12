import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSiteName } from "/imports/utils/getSiteName";

import { JoinLink } from "../../joinLink";
import { Invitations } from "../../invitations";
import { Members } from "./Members";
import { FoundAdmins } from "./FoundAdmins";
import { FoundMembers } from "./FoundMembers";
import { Admins } from "./Admins";

import "./styles.scss";

export interface Props {
  tenant: TenantModel;
}

export function Settings({ tenant }: Props) {
  const { t } = useTranslation();
  const siteName = useSiteName();

  const [memberSearch, setMemberSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

  function members() {
    return tenant.members.filter((m) => !tenant.admins.includes(m)) || [];
  }

  return (
    <div className="row">
      <div className="col-md">
        <h3>
          <span className="fa-solid fa-users fa-fw" aria-hidden="true" />{" "}
          {t("tenant.settings.title.Members", "Members")} ({members().length})
        </h3>
        <div className="icon-text-icon">
          <div className="icon-text-text">
            {t(
              "tenant.settings.members.description",
              "Members can see and use the above regions in the organisation {TENANT}.",
              { TENANT: tenant.name },
            )}
          </div>
        </div>
        <br />
        <Members tenant={tenant} />
        <div className="mb-3">
          <label className="form-label" htmlFor="AddTenantMember">
            {t(
              "tenant.settings.field.addMembers",
              'Add existing {SITENAME} members to your "{TENANTNAME}" organization.',
              { SITENAME: siteName, TENANTNAME: tenant.name },
            )}
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <span className="fa-solid fa-user fa-fw" aria-hidden="true" />
            </span>
            <input
              data-test="tenant-setting-member-search"
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
        <Admins tenant={tenant} />
        <div className="mb-3">
          <label className="form-label" htmlFor="AddTenantAdmin">
            {t(
              "tenant.settings.field.addAdmins",
              'Add an existing {SITENAME} user as a new admin to your "{TENANTNAME}" organization.',
              { SITENAME: siteName, TENANTNAME: tenant.name },
            )}
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <span className="fa-solid fa-user fa-fw" aria-hidden="true" />
            </span>
            <input
              data-test="tenant-setting-admin-search"
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

// for Blaze

import "./template.html";
import { TenantModel } from "/imports/api/tenants/tenants";

Template.registerHelper("TenantSettings", () => Settings);
