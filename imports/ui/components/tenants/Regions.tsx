import React from "react";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { useTranslation } from "react-i18next";

import { useFindFilter } from "/imports/api/regions/publications";
import { TenantModel } from "/imports/api/tenants/tenants";

export interface Props {
  tenant: TenantModel;
}

export function Regions({ tenant }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const [isLoading, regions] = useFindFilter({ tenants: [tenant._id] });

  if (isLoading()) {
    return null;
  }

  return (
    <>
      <h3>{t("tenant.details.regions.title", "Regions")}</h3>
      <div className="row responsive-table-head">
        <div className="col-md-2">{t("tenant.details.regions.name", "Name")}</div>
        <div className="col-md-2">
          {t("tenant.details.regions.numberOfGroups", "Number of groups")}
        </div>
        <div className="col-md-2">
          {t("tenant.details.regions.numberOfUpcomingEvents", "Number of upcoming events")}
        </div>
        <div className="col-md-6">{t("tenant.details.regions.description", "Description")}</div>
      </div>
      {regions.map((region) => (
        <div key={region._id} className="row responsive-table-row">
          <div className="col-6 responsive-table-head">{t("tenant.details.regions.name")}</div>
          <div className="col-6 col-md-2">
            <a href={Router.path("regionDetails", { _id: region._id })}>{region.name}</a>
          </div>

          <div className="col-6 responsive-table-head">
            {t("tenant.details.regions.numberOfGroups")}
          </div>
          <div className="col-6 col-md-2">{region.groupCount}</div>

          <div className="col-6 responsive-table-head">
            {t("tenant.details.regions.numberOfUpcomingEvents")}
          </div>
          <div className="col-6 col-md-2">{region.futureEventCount}</div>

          <div className="col-6 responsive-table-head">
            {t("tenant.details.regions.description")}
          </div>
          <div className="col-6 col-md-6 text-truncate">{region.description}</div>
        </div>
      ))}
      {tenant.editableBy(user) && (
        <a
          className="btn btn-add"
          href={Router.url("regionCreate", {}, { query: { tenant: tenant._id } })}
        >
          {t("tenant.details.regions.createNew.button", "Create a new region")}
        </a>
      )}
    </>
  );
}
