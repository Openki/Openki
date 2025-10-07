import { Accounts } from "meteor/accounts-base";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import "/imports/ui/components/regions/selection/wrap";
import "/imports/ui/components/language-selection";



import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"loginButton">;

const template = Template.loginButton;

template.helpers({
  loginServicesConfigured() {
    return Accounts.loginServicesConfigured();
  },
});

template.events({
  "click .js-loginButton"() {
    Session.set("pleaseLogin", true);
  },
});

export function LoginButton(){

  return {{#if loginServicesConfigured}}
    {{#if currentUser}}
      <a className="loginButton nav-link text-white" aria-expanded="false" data-bs-toggle="dropdown"
         role="button">
        <span className="fa-solid fa-user fa-fw" aria-hidden="true"></span>
        {{currentUser.getDisplayName}}
      </a>
    {{else}}
      <a className="loginButton nav-link text-white js-loginButton" role="button">
        <span className="fa-solid fa-right-to-bracket fa-fw" aria-hidden="true"></span>
        {{i18n 'login.navig.unlogged' 'Log in/register'}}
      </a>
    {{/if}}
  {{/if}}
}
