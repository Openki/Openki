import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { _ } from "meteor/underscore";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import { LanguageEntity, Languages } from "/imports/api/languages/languages";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import * as StringTools from "/imports/utils/string-tools";
import { MeteorAsync } from "/imports/utils/promisify";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "languageSelection",
  { onClose: () => void },
  {
    searchHasFocus: boolean;
    languageSearch: ReactiveVar<string>;
  }
>;

const template = Template.languageSelection;

template.onCreated(function () {
  this.languageSearch = new ReactiveVar("");
});

template.onRendered(function () {
  const instance = this;

  instance.$(".js-language-search").trigger("select");

  instance.$(".dropdown").on("hide.bs.dropdown", () => {
    instance.data.onClose();
  });
});

template.helpers({
  inNavbarClasses() {
    if (this.inNavbar) {
      return "nav-item text-center col col-lg-auto";
    }
    return "";
  },

  setLanguage() {
    return Languages.find(Session.get("locale")).fetch()[0];
  },

  languages() {
    const visibleLanguages = Languages.find({ visible: true });
    const search = Template.instance().languageSearch.get().toLowerCase();
    const results: LanguageEntity[] = [];

    visibleLanguages.forEach((visibleLanguage) => {
      let pushed = false;
      [visibleLanguage.name, visibleLanguage.english].every((property) => {
        if (pushed) {
          return false;
        }
        if (property.toLowerCase().includes(search)) {
          results.push(visibleLanguage);
          pushed = true;
        }
        return true;
      });
    });
    return results;
  },

  languageNameMarked(this: LanguageEntity) {
    const search = Template.instance().languageSearch.get();
    const { name } = this;
    return StringTools.markedName(search, name);
  },

  currentLanguage(this: LanguageEntity) {
    return this.lg === Session.get("locale");
  },

  helpLink() {
    return getLocalizedValue(PublicSettings.i18nHelpLink);
  },
});

const updateLanguageSearch = _.debounce((instance: ReturnType<(typeof Template)["instance"]>) => {
  let search = instance.$(".js-language-search").val();
  search = String(search).trim();
  if (!(instance.languageSearch.get() === search)) {
    instance.languageSearch.set(search);
    instance.$(".dropdown-toggle").dropdown("show");
  }
}, 100);

template.events({
  "click .js-language-link"(this: LanguageEntity, event, instance) {
    event.preventDefault();

    routerAutoscroll.cancelNext();

    // eslint-disable-next-line no-param-reassign
    instance.searchHasFocus = false;
    instance.$(".js-region-search").trigger("focusout");
    instance.$(".dropdown-toggle").dropdown("hide");

    const { lg } = this;

    try {
      localStorage.setItem("locale", lg);
    } catch {
      // ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
    }
    // The db user update happens in the /imports/startup/client/locale.ts in Tracker.autorun(() => { ...
    Session.set("locale", lg);

    instance.data.onClose();
  },
  "keyup .js-language-search"(_event, instance) {
    // eslint-disable-next-line no-param-reassign
    instance.searchHasFocus = true;
    updateLanguageSearch(instance);
  },

  "submit .js-language-selection-form"(event, instance) {
    event.preventDefault();
    instance.$(".js-language-link").first().trigger("click");
  },

  "focus .js-language-search"(_event, instance) {
    instance.$(".dropdown-toggle").dropdown("show");
  },

  "focusin/focusout .js-language-search"(event, instance) {
    // eslint-disable-next-line no-param-reassign
    instance.searchHasFocus = event.type === "focusin";
  },

  async "show.bs.dropdown"(_event, instance) {
    if (!instance.searchHasFocus) {
      await MeteorAsync.defer();

      instance.$(".js-language-search").trigger("select");
    }
  },

  "hide.bs.dropdown"(_event, instance) {
    if (!instance.searchHasFocus) {
      instance.data.onClose();
      return true;
    }

    return false;
  },
});
