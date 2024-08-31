import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Regions } from "/imports/api/regions/regions";

import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/courses/find";
import "/imports/ui/components/dashboard";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "dashboardPage",
  Record<string, string> & {
    internal: boolean;
    region: string;
  }
>;

const template = Template.dashboardPage;

template.onCreated(function () {
  const instance = this;

  instance.autorun(() => {
    const { search } = Template.currentData();
    if (search) {
      Metatags.setCommonTags(i18n("find.windowtitle", 'Find "{SEARCH}"', { SEARCH: search }));
    } else {
      Metatags.setCommonTags(i18n("find.WhatLearn?"));
    }
  });
});

template.helpers({
  region() {
    return Regions.currentRegion();
  },
});
