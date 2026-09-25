import React from "react";
import { useTranslation } from "react-i18next";
import { MetaTags } from "/imports/ui/components/MetaTags";
import { useUser } from "/imports/utils/react-meteor-data";

import { TenantModel } from "/imports/api/tenants/tenants";

import { Settings } from "../../components/tenants/settings";
import { Regions } from "../../components/tenants/Regions";

import "./styles.scss";

export interface Props {
  tenant: TenantModel;
}

export function TenantDetailsPage({ tenant }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  return (
    <>
      <MetaTags title={tenant.name} />

      <div className="container">
        <div className="page-component tenant-details">
          <div className="tenant-details-titlebar">{t("tenant.details.tenant", "Tenant")}</div>
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
    </>
  );
}

// for Blaze
import "./template.html";

Template.registerHelper("TenantDetailsPage", () => TenantDetailsPage);
