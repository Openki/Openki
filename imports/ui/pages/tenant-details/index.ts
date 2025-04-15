import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Meteor } from "meteor/meteor";

import { TenantModel } from "/imports/api/tenants/tenants";

import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/buttons";
import "/imports/ui/components/editable";
import "/imports/ui/components/tenants/settings";
import "/imports/ui/components/tenants/regions";

import "./template.html";
import "./styles.scss";

export interface Data {
  tenant: TenantModel;
}

const Template = TemplateAny as TemplateStaticTyped<"tenantDetailsPage", Data>;

const template = Template.tenantDetailsPage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    const { tenant } = Template.currentData();
    Metatags.setCommonTags(tenant.name);
  });
});

template.helpers({
  editingSettings() {
    const { tenant } = Template.instance().data;
    return tenant.editableBy(Meteor.user());
  },
});
