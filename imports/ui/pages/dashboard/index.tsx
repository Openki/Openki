/* eslint-disable no-nested-ternary */
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PublicSettings } from "/imports/utils/PublicSettings";

import * as Metatags from "/imports/utils/metatags";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import { Find } from "../../components/courses/find";
import { Dashboard } from "../../components/dashboard";

export interface Props {
  query: Record<string, string | undefined>;
}

export function DashboardPage({ query }: Props) {
  const { group, search } = query;
  const { t } = useTranslation();
  const region = useCurrentRegion();

  useEffect(() => {
    if (search) {
      Metatags.setCommonTags(t("find.windowtitle", 'Find "{SEARCH}"', { SEARCH: search }));
    } else {
      Metatags.setCommonTags(t("find.WhatLearn?"));
    }
  });

  return (
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
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("DashboardPage", () => DashboardPage);
