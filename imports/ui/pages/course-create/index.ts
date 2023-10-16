import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/courses/edit";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"courseProposePage">;

const template = Template.courseProposePage;

template.onCreated(function () {
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("course.propose.windowtitle", "Propose new course"));
  });
});
