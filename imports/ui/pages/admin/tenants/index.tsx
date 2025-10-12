import { Mongo } from "meteor/mongo";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { TenantEntity, TenantModel } from "/imports/api/tenants/tenants";

import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "./template.html";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export interface Data {
  tenants: Mongo.Cursor<TenantEntity, TenantModel> | never[];
}

const Template = TemplateAny as TemplateStaticTyped<"adminTenantsPage", Data>;

const template = Template.adminTenantsPage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  useEffect(() => {
    Metatags.setCommonTags(i18n("tenants.windowtitle", "Organizations"));
  });
});


export function Tenants(){
   const { t } = useTranslation();
  
   useEffect(() => {
    Metatags.setCommonTags(i18n("tenants.windowtitle", "Organizations"));
  });

 return   <><h3>
    {t('tenants.title', 'Organizations')}
  </h3>

  <div class="list-group">
    {{#each tenant in tenants}}
      <a href="{{pathFor 'tenantDetails' data=tenant}}"
         class="list-group-item list-group-item-action">
        <span class="fa-solid fa-user fa-fw" aria-hidden="true"></span>
        {{tenant.name}}
      </a>
    {{/each}}
  </div></>
}
