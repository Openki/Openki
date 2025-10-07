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
