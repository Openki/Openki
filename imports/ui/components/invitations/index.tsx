import React from "react";
import { useTranslation } from "react-i18next";

import { TenantEntity } from "/imports/api/tenants/tenants";

import { Create } from "./Create";
import { List } from "./List";

export interface Props {
  tenant: TenantEntity;
}

export function Invitations({ tenant }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <h3>
        <i className="fa-solid fa-envelope fa-fw" />{" "}
        {t("tenant.settings.title.invitations", "Invite via email")}
      </h3>
      <Create tenant={tenant} />
      <List tenantId={tenant._id} />
    </>
  );
}

// for Blaze
import "./template.html";

Template.registerHelper("Invitations", () => Invitations);
