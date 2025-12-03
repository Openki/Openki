import React from "react";
import { useTranslation } from "react-i18next";
import { PublicSettings } from "/imports/utils/PublicSettings";

import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import { MetaTags } from "/imports/ui/components/MetaTags";
import { Find } from "../../components/courses/find";
import { Dashboard } from "../../components/dashboard";

export interface Props {
  query: Record<string, string | undefined>;
}

export function DashboardPage({ query }: Props) {
  const { group, search } = query;
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
          <Dashboard defaultRegion={region._id} list={region.dashboard} defaultGroup={group} />
        ) : PublicSettings.regionDashboardDefault ? (
          <Dashboard
            defaultRegion={region?._id}
            list={PublicSettings.regionDashboardDefault}
            defaultGroup={group}
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
