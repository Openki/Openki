import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Router } from "meteor/iron:router";

import * as Alert from "/imports/api/alerts/alert";
import { InvitationEntity } from "/imports/api/invitations/invitations";
import * as InvitationsMethods from "/imports/api/invitations/methods";
import { TenantModel } from "/imports/api/tenants/tenants";

import { PleaseLogin } from "/imports/ui/lib/please-login";
import * as RegionSelection from "/imports/utils/region-selection";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "invitationPage",
  {
    tenant: TenantModel;
    invitation: InvitationEntity;
  }
>;

const template = Template.invitationPage;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(() => {
    const { tenant } = Template.currentData();
    const title = i18n("invitation.show.siteTitle", "Join {TENANT}", {
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
        await InvitationsMethods.join(
          instance.data.invitation.tenant,
          instance.data.invitation.token,
        );

        // Reload regions to load regions from tenant
        RegionSelection.subscribe(instance, instance.data.invitation.tenant, false);

        Router.go("/");

        Alert.success(
          i18n("invitation.join.success", 'You joined "{NAME}".', {
            NAME: instance.data.tenant.name,
          }),
        );
      } catch (err) {
        Alert.serverError(err, i18n("invitation.join.error", "Join not worked."));
      } finally {
        instance.busy(false);
      }
    });
  },
});
