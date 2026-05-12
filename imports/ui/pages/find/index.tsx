import React from "react";

import { useTranslation } from "react-i18next";
import { MetaTags } from "/imports/ui/components/MetaTags";

import { Find } from "../../components/groups/find";

export interface Props {
  query: Record<string, string | undefined>;
}

export function FindPage({ query }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <MetaTags
        title={
          query.search
            ? t("find.windowtitle", 'Find "{SEARCH}"', { SEARCH: query.search })
            : t("find.WhatLearn?")
        }
      />

      <div className="container">
        <Find query={query} />
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("FindPage", () => FindPage);
