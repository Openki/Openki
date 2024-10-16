import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Meteor } from "meteor/meteor";

import "./modal";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"emailRequest">;

const template = Template.emailRequest;

template.helpers({
  showEmailRequest() {
    const user = Meteor.user();
    return user && !user.hasEmail();
  },
});
