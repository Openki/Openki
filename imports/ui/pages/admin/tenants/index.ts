import { Mongo } from "meteor/mongo";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { TenantEntity, TenantModel } from "/imports/api/tenants/tenants";

import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "./template.html";

export type Data = { tenants: Mongo.Cursor<TenantEntity, TenantModel> | never[] };

const Template = TemplateAny as TemplateStaticTyped<"adminTenantsPage", Data>;

const template = Template.adminTenantsPage;

template.onCreated(function () {
  const instance = this;

  instance.autorun(() => {
    Metatags.setCommonTags(i18n("tenants.windowtitle", "Organizations"));
  });
});
