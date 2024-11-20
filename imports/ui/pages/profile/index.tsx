import React, { useEffect, useState } from "react";
import { Mongo } from "meteor/mongo";
// import { Accounts } from "meteor/accounts-base";
import { Router } from "meteor/iron:router";
// import { ValidationError } from "meteor/mdg:validation-error";
import { useTranslation } from "react-i18next";
// import { NotAllowedCharacter } from "/imports/startup/both/NotAllowedCharacter";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import * as usersMethods from "/imports/api/users/methods";
import { VenueEntity, VenueModel } from "/imports/api/venues/venues";
import { TenantEntity, TenantModel } from "/imports/api/tenants/tenants";
import { GroupEntity } from "/imports/api/groups/groups";

import * as Analytics from "/imports/ui/lib/analytics";
// import { Editable } from "/imports/ui/lib/editable";
// import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import * as Metatags from "/imports/utils/metatags";

import { useSearchParams } from "/imports/utils/react-meteor-router";
import { AvatarForm } from "../../components/avatarForm";
import { DeleteConfirm } from "../../components/delete-confirm";
import { VerifyEmail } from "../../components/profiles/verify-email";
import { GroupTag } from "../../components/groups/tag";
import { VenueLink } from "../../components/venues/link";
import { PublicSettings } from "/imports/utils/PublicSettings";

import "./styles.scss";

function AdminSection() {
  const { t } = useTranslation();
  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.administration.title", "Administration")}</h3>
      <h5>
        {t("profile.administration.link", "You are an administrator of {SITENAME}", {
          SITENAME: PublicSettings.siteName,
        })}
      </h5>
      <a className="button btn btn-primary" href={Router.path("adminPanel")}>
        {t("profile.administration.button", "Visit admin panel")}
      </a>
    </div>
  );
}

function TenantSection({ tenants }: { tenants: Mongo.Cursor<TenantEntity, TenantModel> }) {
  const { t } = useTranslation();

  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.tenants", "My organizations")}</h3>
      <h5>
        {t(
          "profile.tenantMembership",
          "You are {NUM_TENANTS, plural, =0{not admin of any organization} one{admin of the organization:} other{admin of # organizations:} }",
          { NUM_TENANTS: tenants.count() },
        )}
      </h5>
      <ul className="list-unstyled">
        {tenants.map((tenant) => (
          <li className="mb-3">
            <div className="tag tag-link tenant-tag">
              <a href={Router.path("tenantDetails", { _id: tenant._id })}>{tenant.name}</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GroupSection({ groups }: { groups: Mongo.Cursor<GroupEntity, GroupEntity> }) {
  const { t } = useTranslation();
  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.groups", "My groups")}</h3>
      <h5>
        {t(
          "profile.groupMembership",
          "You are {NUM_GROUPS, plural, =0{not member of any group} one{member of the group:} other{member of # groups:} }",
          {
            NUM_GROUPS: groups.count(),
          },
        )}
      </h5>
      <ul className="list-unstyled">
        {groups.map((group) => (
          <li className="mb-3">
            <GroupTag groupId={group._id} full={true} />
          </li>
        ))}
      </ul>
      <a
        className="btn btn-add"
        href={Router.path("groupDetails", {
          _id: "create",
        })}
      >
        {t("profile.createNewGroup.button", "Create a new group")}
      </a>
    </div>
  );
}
function VenuesSection({ venues }: { venues: Mongo.Cursor<VenueEntity, VenueModel> }) {
  const { t } = useTranslation();
  function isVenueEditor() {
    return venues.count() > 0;
  }
  return (
    <div className="page-component page-component-seperated profile-venues-list">
      <h3>{t("profile.venues", "My venues")}</h3>
      {isVenueEditor() ? (
        <ul className="list-unstyled">
          {venues.map((venue) => (
            <li className="mb-3">
              <VenueLink venue={venue} />
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("userprofile.noOwnVenues", "You're not an editor of any venue.")}</p>
      )}
      <a
        className="btn btn-add"
        href={Router.path("venueDetails", {
          _id: "create",
        })}
      >
        {t("profile.createNewVenue.button", "Create a new venue")}
      </a>
    </div>
  );
}

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

function UnsubscribeResultAlerts() {
  const { t } = useTranslation();
  const query = useSearchParams();
  function notificationsUnsubscribeSuccess() {
    return query?.unsubscribed === "notifications";
  }
  function privateMessagesUnsubscribeSuccess() {
    return query?.unsubscribed === "privatemessages";
  }
  function unsubscribeError() {
    return query?.["unsubscribe-error"] === "";
  }

  if (notificationsUnsubscribeSuccess()) {
    Analytics.trackEvent(
      "Unsubscribes from notifications",
      "Unsubscribes from notifications via e-mail",
    );
  }
  if (privateMessagesUnsubscribeSuccess()) {
    Analytics.trackEvent(
      "Unsubscribes from notifications",
      "Unsubscribes from private messages via e-mail",
    );
  }
  return (
    <>
      {notificationsUnsubscribeSuccess() ? (
        <div className="alert alert-success" role="alert">
          <span className="fa-stack fa-lg">
            <i className="fa-regular fa-envelope fa-stack-1x"></i>
            <i className="fa-solid fa-ban fa-stack-2x"></i>
          </span>{" "}
          {t(
            "notifications.unsubscribeSuccess",
            "You have unsubscribed from automated notifications.",
          )}
        </div>
      ) : null}
      {privateMessagesUnsubscribeSuccess() ? (
        <div className="alert alert-success" role="alert">
          <span className="fa-stack fa-lg">
            <i className="fa-regular fa-envelope fa-stack-1x"></i>
            <i className="fa-solid fa-ban fa-stack-2x"></i>
          </span>{" "}
          {t("privateMessages.unsubscribeSuccess", "You will not get private messages from users.")}
        </div>
      ) : null}
      {unsubscribeError() ? (
        <div className="alert alert-danger" role="alert">
          <span className="fa-stack fa-lg">
            <i className="fa-regular fa-envelope fa-stack-1x"></i>
            <i className="fa-solid fa-ban fa-stack-2x"></i>
          </span>{" "}
          {t("notifications.unsubscribeError", "Could not unsubscribe. Please Try again.")}
        </div>
      ) : null}
    </>
  );
}

export function ProfilePage(data: ProfilePageData) {
  const { t } = useTranslation();
  const user = useUser();
  const [changingPass] = useState(false);

  function tenantCount() {
    return data.user.tenants.count();
  }
  function notificationsChecked() {
    return data.user.notifications;
  }
  function allowPrivateMessagesChecked() {
    return data.user.allowPrivateMessages;
  }

  // function editableName() {
  //   return Template.instance().editableName;
  // }
  // function editableDescription() {
  //   return Template.instance().editableDescription;
  // }
  function isAdmin() {
    return user?.privileged("admin");
  }
  function isVisitor() {
    return user?.privileged("visitor");
  }
  function deleteConfirmAttr() {
    return {
      confirmText: t(
        "profile.reallydelete",
        "Please confirm that you would like to delete your profile. This cannot be undone, you will have to create a new account if you want to use this site again.",
      ),
      confirmButton: t("profile.delete.confirm.button", "Delete my user and all its profile"),
      onRemove: async () => {
        await usersMethods.selfRemove();

        Alert.success(t("profile.deleted", "Your account has been deleted"));
      },
      busyButton: t("profile.delete.confirm.button.busy", "Deleting profile…"),
    };
  }

  useEffect(() => {
    if (!user) {
      return;
    }
    const title = t("profile.settings.windowtitle", "My Profile Settings - {USER}", {
      USER: user.getDisplayName(),
    });
    Metatags.setCommonTags(title);
  });

  return (
    <div className="container mw-md">
      {!isVisitor() ? (
        <div className="page-component">
          <h1>
            <span className="fa-solid fa-gears fa-fw" aria-hidden="true"></span>{" "}
            {t("login.frame.settings")}
          </h1>
        </div>
      ) : null}
      <UnsubscribeResultAlerts />
      {!user ? (
        t("profile.not_logged_in", "You are not logged in")
      ) : (
        <>
          <div className="page-component">
            <div className="row g-3">
              <div className="col-6 col-sm-3">
                <AvatarForm />
              </div>

              <div className="col-sm-9">
                <h2 className="mt-4">{/* {{> editable editableName}} */}</h2>
                <p>{/* {{> editable editableDescription}} */}</p>
                <a className="btn btn-primary" href={Router.path("userprofile", { _id: user._id })}>
                  <span className="fa-solid fa-user fa-fw" aria-hidden="true"></span>{" "}
                  {t("login.frame.profile", "Public profile")}
                </a>
              </div>
            </div>
          </div>

          {!isVisitor() ? (
            <>
              {data.user.email ? (
                <div className="page-component page-component-seperated">
                  <h3>{t("profile.email_settings", "E-mail settings")}</h3>
                  <div className="row g-4 mb-2">
                    <div className="col-sm-6">
                      <form className="row g-2 mb-2 js-email-form">
                        <div className="col {{errorClass 'email'}}">
                          <label htmlFor="editform_email" className="sr-only">
                            {t("profile.email", "E-mail")}
                          </label>

                          <input
                            className="form-control js-email"
                            id="editform_email"
                            type="text"
                            value={data.user.email}
                          />
                          {/* {{errorMessage 'email'}} */}
                        </div>
                        <div className="col-auto">{/* {{> buttonSave}} */}</div>
                      </form>
                      {!data.user.verified ? <VerifyEmail /> : null}
                    </div>
                    <div className="col-sm-6">
                      <div className="form-check form-switch mb-2">
                        <input
                          className="form-check-input js-notifications"
                          type="checkbox"
                          value=""
                          id="notificationsCheck"
                          checked={notificationsChecked()}
                        />
                        <label className="form-check-label" htmlFor="notificationsCheck">
                          {t(
                            "profile.toggle.notifications",
                            "Receive automated notifications via e-mail",
                          )}
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input js-allowPrivateMessages"
                          type="checkbox"
                          value=""
                          id="allowPrivateMessagesCheck"
                          checked={allowPrivateMessagesChecked()}
                        />
                        <label className="form-check-label" htmlFor="allowPrivateMessagesCheck">
                          {t(
                            "profile.toggle.allowPrivateMessages",
                            "Receive private messages from users via e-mail",
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {isAdmin() ? <AdminSection /> : null}
              {tenantCount() ? <TenantSection tenants={data.user.tenants} /> : null}
              <GroupSection groups={data.user.groups} />
              <VenuesSection venues={data.user.venues} />
            </>
          ) : (
            <div className="page-component page-component-seperated">
              <h3>{t("profile.createUser.title", "Create user")}</h3>
              <p>
                {t(
                  "profile.createUser.description",
                  "You are currently here as a guest user. If you want to be able to log in again later or from an other device, you can create a normal user account here. For this, we will send you an email with the instructions and a link to set a password for your account.",
                )}
              </p>

              <a
                className="button btn btn-primary"
                href={Router.path("resetPasswortEmail", { email: data.user.email })}
              >
                {t("profile.createUser.button", "Send me an account creation email")}
              </a>
            </div>
          )}

          <div className="page-component page-component-seperated">
            <h3>{t("profile.danger_zone", "Danger zone")}</h3>

            {!isVisitor() ? (
              <div className="mb-3">
                {!changingPass ? (
                  <button type="button" className="btn btn-secondary js-change-pwd-btn">
                    {t("profile.changePass", "Change my password")}
                  </button>
                ) : (
                  <div className="border border-success text-primary p-3">
                    <form className="js-change-pwd">
                      <div className="row mb-2">
                        <label htmlFor="oldpassword" className="col-sm-4 col-form-label text-end">
                          {t("profile.input.oldPassword", "Your current password")}
                        </label>
                        <div className="col-sm-8">
                          <input
                            type="password"
                            className="js-old-pwd form-control"
                            id="oldpassword"
                            value=""
                          />
                        </div>
                      </div>
                      <div className="row mb-2">
                        <label htmlFor="newpassword" className="col-sm-4 col-form-label text-end">
                          {t("profile.input.newPassword", "New password")}
                        </label>
                        <div className="col-sm-8">
                          <input
                            type="password"
                            className="js-new-pwd form-control"
                            id="newpassword"
                            value=""
                          />
                        </div>
                      </div>
                      <div className="row mb-2">
                        <label
                          htmlFor="newpassword_confirm"
                          className="col-sm-4 col-form-label text-end"
                        >
                          {t("profile.input.repeatPassword", "Repeat new password")}
                        </label>
                        <div className="col-sm-8">
                          <input
                            type="password"
                            className="js-new-pwd-confirm form-control"
                            id="newpassword_confirm"
                            value=""
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2 justify-content-end">
                        {/* {{> buttonSave}}
    {{> buttonCancel event="js-change-pwd-cancel"}} */}
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ) : null}

            <div>
              <DeleteConfirm {...deleteConfirmAttr()} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// const TemplateBase = TemplateAny as TemplateStaticTyped<
//   "profilePage",
//   ProfilePageData,
//   {
//     changingPass: ReactiveVar<boolean>;
//     notificationsUnsubscribeSuccess: () => boolean;
//     privateMessagesUnsubscribeSuccess: () => boolean;
//     unsubscribeError: () => boolean;
//     editableName: Editable;
//     editableDescription: Editable;
//   }
// >;

// // Add FormfieldError Handling to the profilePage Template

// const Template = TemplateMixins.FormfieldErrors(TemplateBase, "profilePage", {
//   noEmail: {
//     text: () => t("warning.noEmailProvided", "Please enter an e-mail address."),
//     field: "email",
//   },
//   emailNotValid: {
//     text: () => t("warning.emailNotValid", "Your e-mail address seems to have an error."),
//     field: "email",
//   },
//   emailExists: {
//     text: () => t("warning.emailExists", "This e-mail address is already in use."),
//     field: "email",
//   },
// });

// const template = Template.profilePage;

// template.onCreated(function () {
//   const instance = this;

//   instance.busy(false);

//   instance.editableName = new Editable(
//     false,
//     t("profile.name.placeholder", "Username"),
//     undefined,
//     {
//       serverValidationErrors: [
//         {
//           type: "noUserName",
//           message: () => t("warning.noUserName", "Please enter a name for your user."),
//         },
//         {
//           type: "notAllowedCharacter",
//           message: () =>
//             t("register.warning.notAllowedCharacter", undefined, {
//               CHARACTERS: NotAllowedCharacter.join(", "),
//             }),
//         },
//         {
//           type: "userExists",
//           message: () =>
//             t("warning.userExists", "This username is already in use. Please choose another one."),
//         },
//         {
//           type: "nameError",
//           message: () => t("update.username.failed", "Could not update username."),
//         },
//       ],
//       onSave: async (newName) => {
//         await usersMethods.updateUsername(newName || "");
//       },
//       onSuccess: () => {
//         Alert.success(t("profile.updated", "Updated profile"));
//       },
//     },
//   );
//   instance.editableDescription = new Editable(
//     true,
//     t(
//       "profile.description.placeholder",
//       "About you. Let the community know what your interests are.",
//     ),
//     undefined,
//     {
//       onSave: async (newDescription) => {
//         await usersMethods.updateDescription(newDescription || "");
//       },
//       onSuccess: () => {
//         Alert.success(t("profile.updated", "Updated profile"));
//       },
//     },
//   );

//   instance.autorun(() => {
//     const user = Meteor.user();

//     instance.editableName.setText(user?.username || "");
//     instance.editableDescription.setText(user?.description || "");
//   });
// });

// template.events({
//   "click .js-change-pwd-btn"(_event, instance) {
//     setChangingPass(true);
//     instance.collapse();
//   },

//   "click .js-change-pwd-cancel"(_event, instance) {
//     setChangingPass(false);
//   },

//   async "submit .js-email-form"(event, instance) {
//     event.preventDefault();
//     instance.errors.reset();

//     try {
//       await usersMethods.updateEmail(instance.$(".js-email").val() as string);
//       Alert.success(t("profile.updated", "Updated profile"));
//     } catch (err) {
//       if (ValidationError.is(err)) {
//         (err.details as any).forEach((fieldError: any) => {
//           instance.errors.add(fieldError.type);
//         });
//       }
//     }
//   },

//   async "change .js-notifications"(_event, instance) {
//     routerAutoscroll.cancelNext();

//     const allow = instance.$(".js-notifications").prop("checked");

//     try {
//       await usersMethods.updateAutomatedNotification(allow);

//       Alert.success(t("profile.updated", "Updated profile"));
//       if (!allow)
//         Analytics.trackEvent(
//           "Unsubscribes from notifications",
//           "Unsubscribes from automated notifications via profile",
//         );
//     } catch (err) {
//       instance.errors.add(err.error);
//     }
//   },

//   async "change .js-allowPrivateMessages"(_event, instance) {
//     routerAutoscroll.cancelNext();

//     const allow = instance.$(".js-allowPrivateMessages").prop("checked");

//     try {
//       await usersMethods.updatePrivateMessages(allow);

//       Alert.success(t("profile.updated", "Updated profile"));
//       if (!allow)
//         Analytics.trackEvent(
//           "Unsubscribes from notifications",
//           "Unsubscribes from private messages via profile",
//         );
//     } catch (err) {
//       instance.errors.add(err.error);
//     }
//   },

//   "submit .js-change-pwd"(event, instance) {
//     event.preventDefault();
//     const old = (instance.find(".js-old-pwd") as HTMLInputElement).value;
//     const pass = (instance.find(".js-new-pwd") as HTMLInputElement).value;
//     if (pass !== "") {
//       if (pass !== (instance.find(".js-new-pwd-confirm") as HTMLInputElement).value) {
//         Alert.warning(t("profile.passwordMismatch", "Sorry, your new passwords don't match"));
//         return;
//       }
//       const minLength = 5; // We've got _some_ standards
//       if (pass.length < minLength) {
//         Alert.warning(t("profile.passwordShort", "Your desired password is too short. Sorry."));
//         return;
//       }
//       Accounts.changePassword(old, pass, (err) => {
//         if (err) {
//           Alert.serverError(
//             err,
//             t("profile.passwordChangeError", "Could not change your password"),
//           );
//         } else {
//           Alert.success(t("profile.passwordChangedSuccess", "You have changed your password."));
//           setChangingPass(false);
//         }
//       });
//     }
//   },
// });

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("ProfilePage", () => ProfilePage);
