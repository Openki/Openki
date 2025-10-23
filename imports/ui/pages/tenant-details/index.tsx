import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as Metatags from "/imports/utils/metatags";
import { useUser } from "/imports/utils/react-meteor-data";

import { TenantModel } from "/imports/api/tenants/tenants";

import { Settings } from "../../components/tenants/settings";
import { Regions } from "../../components/tenants/Regions";

import "./styles.scss";

export interface Data {
  tenant: TenantModel;
}

export function TenantDetailsPage({ tenant }: Data) {
  const { t } = useTranslation();
  const user = useUser();

  useEffect(() => {
    Metatags.setCommonTags(tenant.name);
  });

  return (
    <div className="container">
      <div className="page-component tenant-details">
        <div className="tenant-details-titlebar">{t("tenant.details.tenant", "Organization")}</div>
        <div className="details-header tenant-details-header clearfix">
          <div className="tenant-details-name">{tenant.name}</div>
        </div>
        <div className="details-form tenant-settings">
          <Regions tenant={tenant} />
        </div>

        {tenant.editableBy(user) && (
          <div className="details-addition clearfix">
            <Settings tenant={tenant} />
          </div>
        )}
      </div>
    </div>
  );
}

// for Blaze
import "./template.html";

Template.registerHelper("TenantDetailsPage", () => TenantDetailsPage);
