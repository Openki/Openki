import { Meteor } from "meteor/meteor";
import { i18n } from "/imports/startup/both/i18next";
import { Session } from "meteor/session";
import { Random } from "meteor/random";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { AccountsAsync } from "/imports/utils/promisify";

import * as UsersMethods from "/imports/api/users/methods";
import { Regions } from "/imports/api/regions/regions";

import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as TemplateMixins from "/imports/ui/lib/template-mixins";
import * as Viewport from "/imports/ui/lib/viewport";
import * as Analytics from "/imports/ui/lib/analytics";
import { CleanedRegion } from "/imports/ui/lib/cleaned-region";

import "./template.html";

const Template = TemplateMixins.FormfieldErrors(
  TemplateAny as TemplateStaticTyped<"visitorFrame">,
  "visitorFrame",
  {
    noEmail: {
      text() {
        return i18n(
          "visitor.warning.noEmailProvided",
          "Please enter an email-address to continue.",
        );
      },
      field: "email",
    },
    "email invalid": {
      text() {
        return i18n("register.warning.emailNotValid");
      },
      field: "email",
    },
    "Email already exists.": {
      text() {
        return i18n(
          "visitor.warning.emailExists",
          "This email already exists. Have you tried resetting your password?",
        );
      },
      field: "email",
    },
  },
);

const template = Template.visitorFrame;

template.onCreated(function () {
  const instance = this;
  instance.busy(false);
});

template.onRendered(function () {
  const instance = this;

  instance.$("input").first().trigger("select");
});

template.events({
  async "click .js-visitor"(event, instance) {
    event.preventDefault();
    instance.errors.reset();

    const email = instance.$(".js-email").val() as string;
    if (!email) {
      instance.errors.add("noEmail");
    }

    if (instance.errors.present()) {
      return;
    }

    instance.busy("registering");

    try {
      await AccountsAsync.createUser({
        email,
        password: Random.secret(),
        locale: Session.get("locale"),
      } as any);

      if (Viewport.get().width <= ScssVars.gridFloatBreakpoint) {
        $("#bs-navbar-collapse").collapse("hide");
      }
      $(".js-account-tasks").modal("hide");

      const regionId = CleanedRegion(Session.get("region"));
      if (regionId) {
        await UsersMethods.regionChange(regionId);
      }

      await UsersMethods.updateLocale(Session.get("locale"));

      const user = Meteor.user();

      if (!user) {
        throw new Error("Unexpected falsy: user");
      }

      Analytics.trackEvent("Registers", "Visitor", Regions.findOne(user.profile.regionId)?.nameEn);
    } catch (err) {
      instance.errors.add(err.reason);
    } finally {
      instance.busy(false);
    }
  },

  "click .js-back-to-login"(_event, instance) {
    (instance.parentInstance() as any).accountTask.set("login");
  },
});
