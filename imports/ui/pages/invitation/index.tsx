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

        Router.go("home");

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

export function InvitationPage(){
  return   <div className="container">
    <div className="p-2 p-md-5 bg-light rounded-3">
      <div className="container-fluid py-2 py-md-5">
        <h1 className="display-5">
          {{i18n 'invitation.join.welcome' "Welcome to {SITENAME}!" SITENAME=siteName}}
        </h1>
        <p className="fs-4">
          {{i18n 'invitation.join.text' "Become part of the organization {TENANT} and propose, discuss, develop, organize and publish courses with {INVITER} and other nice people in the organization {TENANT}." TENANT=tenant.name INVITER=(username invitation.createdBy)}}
        </p>
        <button className="btn btn-lg btn-save js-join" {{disabledIfBusy}}>
          {{#unless currentUser}}
            {{i18n "invitation.join.newUser" "Join {TENANT}" TENANT=tenant.name}}
          {{else}}
            {{i18n "invitation.join.existingUser" "Join {TENANT} with user {USER}" TENANT=tenant.name USER=currentUser.getDisplayName}}
          {{/unless}}
        </button>
        <a className="btn btn-lg btn-secondary" href="{{pathFor 'home'}}">
          {{i18n 'invitation.join.no' 'No thanks'}}
        </a>
      </div>
    </div>

  </div>
}
