import { Meteor } from "meteor/meteor";
import { i18n } from "/imports/startup/both/i18next";
import { Session } from "meteor/session";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { AccountsAsync } from "/imports/utils/promisify";

import * as Alert from "/imports/api/alerts/alert";
import * as UsersMethods from "/imports/api/users/methods";
import { Regions } from "/imports/api/regions/regions";

import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as TemplateMixins from "/imports/ui/lib/template-mixins";
import * as Viewport from "/imports/ui/lib/viewport";
import * as Analytics from "/imports/ui/lib/analytics";
import { CleanedRegion } from "/imports/ui/lib/cleaned-region";

import "./data-protection-law";

import "./template.html";

const Template = TemplateMixins.FormfieldErrors(
  TemplateAny as TemplateStaticTyped<"registerFrame">,
  "registerFrame",
  {
    noUsername: {
      text() {
        return i18n("register.warning.noUserName", "Please enter a name for your new user.");
      },
      field: "username",
    },
    "Username already exists.": {
      text() {
        return i18n(
          "register.warning.userExists",
          "This username is already in use. Please choose another one.",
        );
      },
      field: "username",
    },
    noPassword: {
      text() {
        return i18n("register.warning.noPasswordProvided", "Please enter a password to register.");
      },
      field: "password",
    },
    noEmail: {
      text() {
        return i18n(
          "register.warning.noEmailProvided",
          "Please enter an email-address to register.",
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
          "register.warning.emailExists",
          "This email already exists. Have you tried resetting your password?",
        );
      },
      field: "email",
    },
  },
);

const template = Template.registerFrame;

template.onCreated(function () {
  const instance = this;
  instance.busy(false);
});

template.onRendered(function () {
  const instance = this;

  const parentInstance = instance.parentInstance() as any;

  const { transferUsername, transferPassword, transferMail } = parentInstance;

  if (transferUsername) {
    instance.$(".js-username").val(transferUsername);
  }

  if (transferPassword) {
    instance.$(".js-password").val(transferPassword);
  }

  if (transferMail) {
    instance.$(".js-email").val(transferMail);
  }

  instance.$("input").first().trigger("select");
});

template.events({
  async "click .js-register"(event, instance) {
    event.preventDefault();
    instance.errors.reset();

    const username = instance.$(".js-username").val() as string;
    if (!username) {
      instance.errors.add("noUsername");
    }

    const password = instance.$(".js-password").val() as string;
    if (!password) {
      instance.errors.add("noPassword");
    }

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
        username,
        password,
        email,
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

      Alert.success(
        i18n(
          "profile.sentVerificationMail",
          'Verification mail has been sent to your address: "{MAIL}".',
          { MAIL: user.emails[0].address },
        ),
      );

      Analytics.trackEvent(
        "Registers",
        "Registers with password",
        Regions.findOne(user.profile.regionId)?.nameEn,
      );
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
