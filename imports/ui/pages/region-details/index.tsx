import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";

import { RegionModel } from "/imports/api/regions/regions";
import * as RegionsMethods from "/imports/api/regions/methods";

import * as Analytics from "/imports/ui/lib/analytics";
import { MetaTags } from "/imports/ui/components/MetaTags";

import { Display, Props as DisplayData } from "/imports/ui/components/regions/display";
import { Edit, Data as EditData } from "/imports/ui/components/regions/edit";

export interface Props {
  isNew: boolean;
  region: RegionModel;
}

export function RegionDetailsPage({ isNew, region }: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  function createArgs() {
    return {
      region,
      title: t("region.edit.titleCreate", "Create new region"),
      async onSave(changes) {
        const regionId = await RegionsMethods.create({ tenant: region.tenant, ...changes });

        Router.go("regionDetails", { _id: regionId });

        Analytics.trackEvent("Region creations", "Region creations");
      },
      onCancel() {
        Router.go("tenantDetails", { _id: region.tenant });
      },
    } as EditData;
  }
  function editArgs() {
    return {
      region,
      title: t("region.edit.titleEdit", "Edit region"),
      async onSave(changes) {
        await RegionsMethods.update(region._id, changes);
        setEditing(false);
      },
      onCancel() {
        setEditing(false);
      },
    } as EditData;
  }
  function displayArgs() {
    return {
      region,
      onEdit() {
        setEditing(true);
      },
      async onDelete() {
        await RegionsMethods.remove(region._id);
        Router.go("tenantDetails", { _id: region.tenant });
      },
    } as DisplayData;
  }

  let title;
  if (isNew) {
    title = t("region.edit.siteTitle.create", "Create region");
  } else {
    title = region.name;
  }

  return (
    <>
      <MetaTags title={title} />

      <div className="container mw-md">
        <a href={Router.path("tenantDetails", { _id: region.tenant })}>
          <i className="fa-solid fa-angle-left fa-fw" />
          {t("regionDetails.goToOverview", "Go to all regions")}
        </a>
        {isNew ? (
          <Edit {...createArgs()} />
        ) : editing ? (
          <Edit {...editArgs()} />
        ) : (
          <Display {...displayArgs()} />
        )}
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("RegionDetailsPage", () => RegionDetailsPage);
