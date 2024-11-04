import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import * as Metatags from "/imports/utils/metatags";

import { Find } from "/imports/ui/components/courses/find";

export type Props = {
  query: {
    [key: string]: string | undefined;
  };
};

export function FindPage({ query }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (query.search) {
      Metatags.setCommonTags(t("find.windowtitle", 'Find "{SEARCH}"', { SEARCH: query.search }));
    } else {
      Metatags.setCommonTags(t("find.WhatLearn?"));
    }
  });

  return (
    <div className="container">
      <Find query={query} />
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("FindPage", () => FindPage);
