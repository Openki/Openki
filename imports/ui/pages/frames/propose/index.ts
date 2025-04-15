import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/account-tasks";
import "/imports/ui/components/courses/edit";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"frameProposePage">;

const template = Template.frameProposePage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("course.propose.windowtitle", "Propose new course"));
  });
});
