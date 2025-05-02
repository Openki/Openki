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

export function JoinPage(){
  return   <div class="container">
  <div class="p-2 p-md-5 bg-light rounded-3">
    <div class="container-fluid py-2 py-md-5">
      <h1 class="display-5">
        {{i18n 'joinPage.welcome' "Welcome to {SITENAME}!" SITENAME=siteName}}
      </h1>
      <p class="fs-4">
        {{i18n 'joinPage.text' "Become part of the organization {TENANT} and propose, discuss, develop, organize and publish courses with {INVITER} and other nice people in the organization {TENANT}." TENANT=tenant.name INVITER=(username invitation.createdBy)}}
      </p>
      <button class="btn btn-lg btn-save js-join" {{disabledIfBusy}}>
        {{#unless currentUser}}
          {{i18n "joinPage.newUser" "Join {TENANT}" TENANT=tenant.name}}
        {{else}}
          {{i18n "joinPage.existingUser" "Join {TENANT} with my user {USER}" TENANT=tenant.name USER=currentUser.getDisplayName}}
        {{/unless}}
      </button>
      <a class="btn btn-lg btn-secondary" href="{{pathFor 'home'}}">
        {{i18n 'joinPage.no' 'No thanks'}}
      </a>
    </div>
  </div>

</div>
}
