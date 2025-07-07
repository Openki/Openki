import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { TenantModel } from "/imports/api/tenants/tenants";

export function TenantSection({ tenants }: { tenants: TenantModel[] }) {
  const { t } = useTranslation();

  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.tenants", "My organizations")}</h3>
      <h5>
        {t(
          "profile.tenantMembership",
          "You are {NUM_TENANTS, plural, =0{not admin of any organization} one{admin of the organization:} other{admin of # organizations:} }",
          { NUM_TENANTS: tenants.length },
        )}
      </h5>
      <ul className="list-unstyled">
        {tenants.map((tenant) => (
          <li key={tenant._id} className="mb-3">
            <div className="tag tag-link tenant-tag">
              <a href={Router.path("tenantDetails", { _id: tenant._id })}>{tenant.name}</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
