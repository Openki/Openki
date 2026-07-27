import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSiteName } from "/imports/utils/getSiteName";

import { TenantModel } from "/imports/api/tenants/tenants";

import { JoinLink } from "../../joinLink";
import { Invitations } from "../../invitations";
import { Members } from "./Members";
import { FoundAdmins } from "./FoundAdmins";
import { FoundMembers } from "./FoundMembers";
import { Admins } from "./Admins";
import { FormControl } from "/imports/ui/components/form-control";

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
          <i className="fa-solid fa-users fa-fw" /> {t("tenant.settings.title.Members", "Members")}{" "}
          <small>
            <span className="badge rounded-pill bg-primary">{members().length}</span>
          </small>
        </h3>
        <p>
          {t(
            "tenant.settings.members.description",
            "Members can see and use the above regions in {TENANT}.",
            { TENANT: tenant.name },
          )}
        </p>
        <Members tenant={tenant} />
        <div className="mb-3">
          <FormControl
            id="tenant-settings-members-search"
            type="search"
            label={t(
              "tenant.settings.field.addMembers",
              "Add existing {SITENAME} members to {TENANT}.",
              { SITENAME: siteName, TENANT: tenant.name },
            )}
            prepend="fa-solid fa-user fa-fw"
            placeholder={t("tenant.settings.field.addMember.placeholder", "Type name of buddy")}
            value={memberSearch}
            onChange={(value) => setMemberSearch(value)}
          />
        </div>
        {memberSearch.length > 0 && <FoundMembers tenant={tenant} userSearch={memberSearch} />}
        <hr />
        <JoinLink tenant={tenant} />
        <hr />
        <Invitations tenant={tenant} />
      </div>
      <div className="col-md">
        <h3>
          <i className="fa-solid fa-users fa-fw" /> {t("tenant.settings.title.admin", "Admins")}{" "}
          <small>
            <span className="badge rounded-pill bg-primary">{tenant.admins.length}</span>
          </small>
        </h3>
        <p>
          {t(
            "tenant.settings.admin.description",
            "Admins are empowered to see and manage this panel here, like you.",
          )}
        </p>
        <Admins tenant={tenant} />
        <div className="mb-3">
          <FormControl
            id="tenant-setting-admins-search"
            type="search"
            label={t(
              "tenant.settings.field.addAdmins",
              "Add an existing {SITENAME} user as a new admin to {TENANT}.",
              { SITENAME: siteName, TENANT: tenant.name },
            )}
            prepend="fa-solid fa-user fa-fw"
            placeholder={t("tenant.settings.field.addAdmin.placeholder", "Type name of buddy")}
            value={adminSearch}
            onChange={(value) => setAdminSearch(value)}
          />
        </div>
        {adminSearch.length > 0 && <FoundAdmins tenant={tenant} userSearch={adminSearch} />}
      </div>
    </div>
  );
}
