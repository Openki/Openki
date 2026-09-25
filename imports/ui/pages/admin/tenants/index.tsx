import React from "react";
import { Mongo } from "meteor/mongo";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { TenantEntity, TenantModel } from "/imports/api/tenants/tenants";

import { MetaTags } from "/imports/ui/components/MetaTags";

export interface Props {
  tenants: Mongo.Cursor<TenantEntity, TenantModel> | never[];
}

export function Tenants({ tenants }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <MetaTags title={t("tenants.windowtitle", "Tenants")} />

      <h3>{t("tenants.title", "Tenants")}</h3>

      <div className="list-group">
        {tenants.map((tenant) => (
          <a
            key={tenant._id}
            href={Router.path("tenantDetails", tenant)}
            className="list-group-item list-group-item-action"
          >
            <i className="fa-solid fa-user fa-fw" /> {tenant.name}
          </a>
        ))}
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("AdminTenantsPage", () => Tenants);
