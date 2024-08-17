import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Accounts } from "meteor/accounts-base";
import { ReactiveVar } from "meteor/reactive-var";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Router } from "meteor/iron:router";
import { ValidationError } from "meteor/mdg:validation-error";

import * as Alert from "/imports/api/alerts/alert";
import * as usersMethods from "/imports/api/users/methods";
import { VenueEntity, VenueModel } from "/imports/api/venues/venues";
import { TenantEntity, TenantModel } from "/imports/api/tenants/tenants";
import { GroupEntity } from "/imports/api/groups/groups";
import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";

import * as TemplateMixins from "/imports/ui/lib/template-mixins";
import * as Analytics from "/imports/ui/lib/analytics";
import { Editable } from "/imports/ui/lib/editable";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { i18n } from "/imports/startup/both/i18next";
import * as Metatags from "/imports/utils/metatags";

import "/imports/ui/components/buttons";
import "/imports/ui/components/groups/tag";
import "/imports/ui/components/profiles/course-list";
import "/imports/ui/components/profiles/verify-email";
import "/imports/ui/components/venues/link";
import "/imports/ui/components/avatarForm";
import "/imports/ui/components/editable";
import "/imports/ui/components/delete-confirm";

import "./template.html";
import "./styles.scss";

export interface ProfilePageData {
  user: {
    _id: string;
    name: string;
    notifications: boolean;
    allowPrivateMessages: boolean;
    tenants: Mongo.Cursor<TenantEntity, TenantModel>;
    groups: Mongo.Cursor<GroupEntity>;
    venues: Mongo.Cursor<VenueEntity, VenueModel>;
    email: string | undefined;
    verified: boolean;
  };
}

const TemplateBase = TemplateAny as TemplateStaticTyped<
  "profilePage",
  ProfilePageData,
  {
    changingPass: ReactiveVar<boolean>;
    notificationsUnsubscribeSuccess: () => boolean;
    privateMessagesUnsubscribeSuccess: () => boolean;
    unsubscribeError: () => boolean;
    editableName: Editable;
    editableDescription: Editable;
  }
>;

// Add Expandible an FormfieldError Handling to the profilePage Template

const TemplateExtended = TemplateMixins.Expandible(TemplateBase, "profilePage");

const Template = TemplateMixins.FormfieldErrors(TemplateExtended, "profilePage", {
  noEmail: {
    text: () => i18n("warning.noEmailProvided", "Please enter an e-mail address."),
    field: "email",
  },
  emailNotValid: {
    text: () => i18n("warning.emailNotValid", "Your e-mail address seems to have an error."),
    field: "email",
  },
  emailExists: {
    text: () => i18n("warning.emailExists", "This e-mail address is already in use."),
    field: "email",
  },
});

const template = Template.profilePage;

template.onCreated(function () {
  const instance = this;

  instance.autorun(() => {
    const user = Meteor.user();
    if (!user) {
      return;
    }
    const title = i18n("profile.settings.windowtitle", "My Profile Settings - {USER}", {
      USER: user.getDisplayName(),
    });
    Metatags.setCommonTags(title);
  });

  instance.busy(false);
  instance.changingPass = new ReactiveVar(false);

  instance.notificationsUnsubscribeSuccess = () =>
    Router.current().params.query.unsubscribed === "notifications";
  instance.privateMessagesUnsubscribeSuccess = () =>
    Router.current().params.query.unsubscribed === "privatemessages";
  instance.unsubscribeError = () => Router.current().params.query["unsubscribe-error"] === "";

  if (instance.notificationsUnsubscribeSuccess()) {
    Analytics.trackEvent(
      "Unsubscribes from notifications",
      "Unsubscribes from notifications via e-mail",
    );
  }
  if (instance.privateMessagesUnsubscribeSuccess()) {
    Analytics.trackEvent(
      "Unsubscribes from notifications",
      "Unsubscribes from private messages via e-mail",
    );
  }

  instance.editableName = new Editable(
    false,
    i18n("profile.name.placeholder", "Username"),
    undefined,
    {
      serverValidationErrors: [
        {
          type: "noUserName",
          message: () => i18n("warning.noUserName", "Please enter a name for your user."),
        },
        {
          type: "userExists",
          message: () =>
            i18n(
              "warning.userExists",
              "This username is already in use. Please choose another one.",
            ),
        },
        {
          type: "nameError",
          message: () => i18n("update.username.failed", "Could not update username."),
        },
      ],
      onSave: async (newName) => {
        await usersMethods.updateUsername(newName || "");
      },
      onSuccess: () => {
        Alert.success(i18n("profile.updated", "Updated profile"));
      },
    },
  );
  instance.editableDescription = new Editable(
    true,
    i18n(
      "profile.description.placeholder",
      "About you. Let the community know what your interests are.",
    ),
    undefined,
    {
      onSave: async (newDescription) => {
        await usersMethods.updateDescription(newDescription || "");
      },
      onSuccess: () => {
        Alert.success(i18n("profile.updated", "Updated profile"));
      },
    },
  );

  instance.autorun(() => {
    const user = Meteor.user();

    instance.editableName.setText(user?.username || "");
    instance.editableDescription.setText(user?.description || "");
  });
});

template.helpers({
  changingPass() {
    return Template.instance().changingPass.get();
  },

  groupCount() {
    return Template.instance().data.user.groups.count();
  },

  tenantCount() {
    return Template.instance().data.user.tenants.count();
  },

  notificationsChecked() {
    if (Template.instance().data.user.notifications) {
      return "checked";
    }
    return "";
  },

  allowPrivateMessagesChecked() {
    if (Template.instance().data.user.allowPrivateMessages) {
      return "checked";
    }
    return "";
  },

  isVenueEditor() {
    return Template.instance().data.user.venues.count() > 0;
  },

  notificationsUnsubscribeSuccess() {
    return Template.instance().notificationsUnsubscribeSuccess();
  },

  privateMessagesUnsubscribeSuccess() {
    return Template.instance().privateMessagesUnsubscribeSuccess();
  },

  unsubscribeError() {
    return Template.instance().unsubscribeError();
  },

  editableName() {
    return Template.instance().editableName;
  },

  editableDescription() {
    return Template.instance().editableDescription;
  },
  isAdmin() {
    return UserPrivilegeUtils.privilegedTo("admin");
  },
  isVisitor() {
    return UserPrivilegeUtils.privilegedTo("visitor");
  },
  deleteConfirmAttr() {
    return {
      confirmText: i18n(
        "profile.reallydelete",
        "Please confirm that you would like to delete your profile. This cannot be undone, you will have to create a new account if you want to use this site again.",
      ),
      confirmButton: i18n("profile.delete.confirm.button", "Delete my user and all its profile"),
      onRemove: async () => {
        await usersMethods.selfRemove();

        Alert.success(i18n("profile.deleted", "Your account has been deleted"));
      },
      busyButton: i18n("profile.delete.confirm.button.busy", "Deleting profile…"),
    };
  },
});

template.events({
  "click .js-change-pwd-btn"(_event, instance) {
    instance.changingPass.set(true);
    instance.collapse();
  },

  "click .js-change-pwd-cancel"(_event, instance) {
    instance.changingPass.set(false);
  },

  async "submit .js-email-form"(event, instance) {
    event.preventDefault();
    instance.errors.reset();

    try {
      await usersMethods.updateEmail(instance.$(".js-email").val() as string);
      Alert.success(i18n("profile.updated", "Updated profile"));
    } catch (err) {
      if (ValidationError.is(err)) {
        (err.details as any).forEach((fieldError: any) => {
          instance.errors.add(fieldError.type);
        });
      }
    }
  },

  async "change .js-notifications"(_event, instance) {
    routerAutoscroll.cancelNext();

    const allow = instance.$(".js-notifications").prop("checked");

    try {
      await usersMethods.updateAutomatedNotification(allow);

      Alert.success(i18n("profile.updated", "Updated profile"));
      if (!allow)
        Analytics.trackEvent(
          "Unsubscribes from notifications",
          "Unsubscribes from automated notifications via profile",
        );
    } catch (err) {
      instance.errors.add(err.error);
    }
  },

  async "change .js-allowPrivateMessages"(_event, instance) {
    routerAutoscroll.cancelNext();

    const allow = instance.$(".js-allowPrivateMessages").prop("checked");

    try {
      await usersMethods.updatePrivateMessages(allow);

      Alert.success(i18n("profile.updated", "Updated profile"));
      if (!allow)
        Analytics.trackEvent(
          "Unsubscribes from notifications",
          "Unsubscribes from private messages via profile",
        );
    } catch (err) {
      instance.errors.add(err.error);
    }
  },

  "submit .js-change-pwd"(event, instance) {
    event.preventDefault();
    const old = (instance.find(".js-old-pwd") as HTMLInputElement).value;
    const pass = (instance.find(".js-new-pwd") as HTMLInputElement).value;
    if (pass !== "") {
      if (pass !== (instance.find(".js-new-pwd-confirm") as HTMLInputElement).value) {
        Alert.warning(i18n("profile.passwordMismatch", "Sorry, your new passwords don't match"));
        return;
      }
      const minLength = 5; // We've got _some_ standards
      if (pass.length < minLength) {
        Alert.warning(i18n("profile.passwordShort", "Your desired password is too short. Sorry."));
        return;
      }
      Accounts.changePassword(old, pass, (err) => {
        if (err) {
          Alert.serverError(
            err,
            i18n("profile.passwordChangeError", "Could not change your password"),
          );
        } else {
          Alert.success(i18n("profile.passwordChangedSuccess", "You have changed your password."));
          instance.changingPass.set(false);
        }
      });
    }
  },
});
