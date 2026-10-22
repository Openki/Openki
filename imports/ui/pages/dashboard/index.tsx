import React from "react";
import { useTranslation } from "react-i18next";
import { PublicSettings } from "/imports/utils/PublicSettings";

import { useCurrentRegion } from "/imports/ui/hooks/useCurrentRegion";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { Find } from "../../components/groups/find";
import { Dashboard } from "../../components/dashboard";

export interface Props {
  query: Record<string, string | undefined>;
}

export function DashboardPage({ query }: Props) {
  const { organization, search } = query;
  const { t } = useTranslation();
  const region = useCurrentRegion();

  return (
    <>
      <MetaTags
        title={
          search
            ? t("find.windowtitle", 'Find "{SEARCH}"', { SEARCH: search })
            : t("find.WhatLearn?")
        }
      />

      <div className="container">
        {region?.dashboard ? (
          <Dashboard
            defaultRegion={region._id}
            list={region.dashboard}
            defaultOrganization={organization}
          />
        ) : PublicSettings.regionDashboardDefault ? (
          <Dashboard
            defaultRegion={region?._id}
            list={PublicSettings.regionDashboardDefault}
            defaultOrganization={organization}
          />
        ) : (
          <Find query={query} />
        )}
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("DashboardPage", () => DashboardPage);
