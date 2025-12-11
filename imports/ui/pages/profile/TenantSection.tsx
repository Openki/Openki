import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { TenantModel } from "/imports/api/tenants/tenants";

export function TenantSection({ tenants }: { tenants: TenantModel[] }) {
  const { t } = useTranslation();

  return (
    <div className="page-component page-component-seperated">
      <h3 data-test="profile-tenant-section-header">{t("profile.tenants", "My tenants")}</h3>
      <h5>
        {t(
          "profile.tenantMembership",
          "You are {NUM_TENANTS, plural, =0{not admin of any tenant} one{admin of the tenant:} other{admin of # tenants:} }",
          { NUM_TENANTS: tenants.length },
        )}
      </h5>
      <ul className="list-unstyled">
        {tenants.map((tenant) => (
          <li key={tenant._id} className="mb-3">
            <div className="tag tag-link tenant-tag">
              <a href={Router.path("tenantDetails", tenant)}>{tenant.name}</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
