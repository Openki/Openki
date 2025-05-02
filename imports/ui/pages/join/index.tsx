import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Router } from "meteor/iron:router";

import * as Alert from "/imports/api/alerts/alert";
import { JoinLinkEntity } from "/imports/api/joinLinks/joinLinks";
import * as JoinLinksMethods from "/imports/api/joinLinks/methods";
import { TenantModel } from "/imports/api/tenants/tenants";

import { PleaseLogin } from "/imports/ui/lib/please-login";
import * as RegionSelection from "/imports/utils/region-selection";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "joinPage",
  {
    tenant: TenantModel;
    joinLink: JoinLinkEntity;
  }
>;

const template = Template.joinPage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    const { tenant } = Template.currentData();
    const title = i18n("joinPage.show.siteTitle", "Join {TENANT}", {
      TENANT: tenant.name,
    });
    Metatags.setCommonTags(title);
  });
});

template.events({
  async "click .js-join"(event, instance) {
    event.preventDefault();

    instance.busy("join");
    PleaseLogin(instance, async () => {
      try {
        await JoinLinksMethods.join(instance.data.joinLink.tenant, instance.data.joinLink.token);

        // Reload regions to load regions from tenant
        RegionSelection.subscribe(instance, instance.data.joinLink.tenant, false);

        Router.go("/");

        Alert.success(
          i18n("joinPage.join.success", 'You joined the organization "{NAME}".', {
            NAME: instance.data.tenant.name,
          }),
        );
      } catch (err) {
        Alert.serverError(err, i18n("joinPage.join.error", "Joining didn't work."));
      } finally {
        instance.busy(false);
      }
    });
  },
});
