import { Session } from "meteor/session";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { LanguagesRaw } from "/imports/api/languages/languages";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<
  "languageDisplay",
  { inNavbar: boolean; onClick: () => void }
>;

const template = Template.languageDisplay;

template.helpers({
  inNavbarClasses() {
    if (Template.instance().data.inNavbar) {
      return "nav-item text-center col col-lg-auto";
    }
    return "";
  },
  inNavbarClassesLink() {
    if (Template.instance().data.inNavbar) {
      return "text-white";
    }
    return "";
  },
  setLanguage() {
    return LanguagesRaw[Session.get("locale")];
  },
});

template.events({
  "click .js-language-display"(_event, instance) {
    instance.data.onClick();
  },
});
