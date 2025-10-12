import React from "react";
import { useEffect } from "react";
import { Mongo } from "meteor/mongo";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { TenantEntity, TenantModel } from "/imports/api/tenants/tenants";

import * as Metatags from "/imports/utils/metatags";

export interface Data {
  tenants: Mongo.Cursor<TenantEntity, TenantModel> | never[];
}

export function Tenants({ tenants }: Data) {
  const { t } = useTranslation();

  useEffect(() => {
    Metatags.setCommonTags(t("tenants.windowtitle", "Organizations"));
  });

  return (
    <>
      <h3>{t("tenants.title", "Organizations")}</h3>

      <div className="list-group">
        {tenants.map((tenant) => (
          <a
            key={tenant._id}
            href={Router.path("tenantDetails", tenant)}
            className="list-group-item list-group-item-action"
          >
            <span className="fa-solid fa-user fa-fw" aria-hidden="true" /> {tenant.name}
          </a>
        ))}
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("AdminTenantsPage", () => Tenants);
