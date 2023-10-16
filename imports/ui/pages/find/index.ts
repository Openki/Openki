import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/courses/find";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "findPage",
  Record<string, string> & {
    internal: boolean;
    region: string;
  }
>;

const template = Template.findPage;

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
