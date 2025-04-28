import React, { useEffect, useState } from "react";
import { AccountsAsync } from "/imports/utils/promisify";
import { Router } from "meteor/iron:router";
import { ValidationError } from "meteor/mdg:validation-error";
import { useTranslation } from "react-i18next";
import { NotAllowedCharacter } from "/imports/startup/both/NotAllowedCharacter";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";
import { PublicSettings } from "/imports/utils/PublicSettings";

import * as Alert from "/imports/api/alerts/alert";
import * as usersMethods from "/imports/api/users/methods";
import { VenueModel } from "/imports/api/venues/venues";
import { TenantModel } from "/imports/api/tenants/tenants";
import { GroupModel } from "/imports/api/groups/groups";
import { UserModel } from "/imports/api/users/users";
import * as Tenants from "/imports/api/tenants/publications";
import * as Venues from "/imports/api/venues/publications";
import * as Groups from "/imports/api/groups/publications";

import { useValidation } from "../../lib/useValidation";
import * as Analytics from "/imports/ui/lib/analytics";
import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import * as Metatags from "/imports/utils/metatags";
import * as Theme from "/imports/utils/theme";

import { Editable, Props as EditableProps } from "/imports/ui/components/editable/index.react";
import { AvatarForm } from "../../components/avatarForm";
import { DeleteConfirm } from "../../components/delete-confirm";
import { VerifyEmail } from "../../components/profiles/verify-email";
import { GroupTag } from "../../components/groups/tag";
import { ButtonCancel, ButtonSubmit } from "../../components/buttons";
import { VenueLink } from "../../components/venues/link";

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

function TenantSection({ tenants }: { tenants: TenantModel[] }) {
  const { t } = useTranslation();

  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.tenants", "My organizations")}</h3>
      <h5>
        {t(
          "profile.tenantMembership",
          "You are {NUM_TENANTS, plural, =0{not admin of any organization} one{admin of the organization:} other{admin of # organizations:} }",
          { NUM_TENANTS: tenants.length },
        )}
      </h5>
      <ul className="list-unstyled">
        {tenants.map((tenant) => (
          <li key={tenant._id} className="mb-3">
            <div className="tag tag-link tenant-tag">
              <a href={Router.path("tenantDetails", { _id: tenant._id })}>{tenant.name}</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GroupSection({ groups }: { groups: GroupModel[] }) {
  const { t } = useTranslation();
  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.groups", "My groups")}</h3>
      <h5>
        {t(
          "profile.groupMembership",
          "You are {NUM_GROUPS, plural, =0{not member of any group} one{member of the group:} other{member of # groups:} }",
          {
            NUM_GROUPS: groups.length,
          },
        )}
      </h5>
      <ul className="list-unstyled">
        {groups.map((group) => (
          <li key={group._id} className="mb-3">
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
function VenuesSection({ venues }: { venues: VenueModel[] }) {
  const { t } = useTranslation();
  function isVenueEditor() {
    return venues.length > 0;
  }
  return (
    <div className="page-component page-component-seperated profile-venues-list">
      <h3>{t("profile.venues", "My venues")}</h3>
      {isVenueEditor() ? (
        <ul className="list-unstyled">
          {venues.map((venue) => (
            <li key={venue._id} className="mb-3">
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
      {notificationsUnsubscribeSuccess() && (
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
      )}
      {privateMessagesUnsubscribeSuccess() && (
        <div className="alert alert-success" role="alert">
          <span className="fa-stack fa-lg">
            <i className="fa-regular fa-envelope fa-stack-1x"></i>
            <i className="fa-solid fa-ban fa-stack-2x"></i>
          </span>{" "}
          {t("privateMessages.unsubscribeSuccess", "You will not get private messages from users.")}
        </div>
      )}
      {unsubscribeError() && (
        <div className="alert alert-danger" role="alert">
          <span className="fa-stack fa-lg">
            <i className="fa-regular fa-envelope fa-stack-1x"></i>
            <i className="fa-solid fa-ban fa-stack-2x"></i>
          </span>{" "}
          {t("notifications.unsubscribeError", "Could not unsubscribe. Please Try again.")}
        </div>
      )}
    </>
  );
}

function EmailSection() {
  const { t } = useTranslation();
  const user = useUser();
  const [isBusy, setIsBusy] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.emailAddress() || "");
  const [errors, , addError, resetErrors] = useValidation({
    noEmail: {
      text: () => t("warning.noEmailProvided", "Please enter an e-mail address."),
      field: "email",
    },
    emailNotValid: {
      text: () => t("warning.emailNotValid", "Your e-mail address seems to have an error."),
      field: "email",
    },
    emailExists: {
      text: () => t("warning.emailExists", "This e-mail address is already in use."),
      field: "email",
    },
  });

  if (!user) {
    return null;
  }

  async function handelEmailChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetErrors();
    setIsBusy(true);
    try {
      await usersMethods.updateEmail(newEmail);
      Alert.success(t("profile.updated", "Updated profile"));
    } catch (err) {
      if (ValidationError.is(err)) {
        (err.details as any).forEach((fieldError: any) => {
          addError(fieldError.type);
        });
      }
    }
    setIsBusy(false);
  }

  async function handelNofitifcationsChange(event: React.ChangeEvent<HTMLInputElement>) {
    routerAutoscroll.cancelNext();

    const allow = event.currentTarget.checked;

    try {
      await usersMethods.updateAutomatedNotification(allow);

      Alert.success(t("profile.updated", "Updated profile"));
      if (!allow)
        Analytics.trackEvent(
          "Unsubscribes from notifications",
          "Unsubscribes from automated notifications via profile",
        );
    } catch (err) {
      Alert.serverError(
        err,
        t("profile.toggle.notifications.error", "Failed to change notifications"),
      );
    }
  }
  async function handelAllowPrivateMessagesChange(event: React.ChangeEvent<HTMLInputElement>) {
    routerAutoscroll.cancelNext();

    const allow = event.currentTarget.checked;

    try {
      await usersMethods.updatePrivateMessages(allow);

      Alert.success(t("profile.updated", "Updated profile"));
      if (!allow)
        Analytics.trackEvent(
          "Unsubscribes from notifications",
          "Unsubscribes from private messages via profile",
        );
    } catch (err) {
      Alert.serverError(
        err,
        t("profile.toggle.allowPrivateMessages.error", "Failed to change allow private messages"),
      );
    }
  }

  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.email_settings", "E-mail settings")}</h3>
      <div className="row g-4 mb-2">
        <div className="col-sm-6">
          <form className="row g-2 mb-2" onSubmit={handelEmailChange}>
            <div className={`col ${errors.email ? "has-error" : ""}`}>
              <label htmlFor="editform_email" className="sr-only">
                {t("profile.email", "E-mail")}
              </label>
              <input
                className="form-control"
                id="editform_email"
                type="text"
                value={newEmail}
                onChange={(event) => {
                  setNewEmail(event.currentTarget.value);
                }}
              />
              {!!errors.email && <span className="form-text d-block">{errors.email}</span>}
            </div>
            <div className="col-auto">
              <ButtonSubmit isBusy={isBusy} />
            </div>
          </form>
          {!user.verifiedEmailAddress() && !isBusy && <VerifyEmail />}
        </div>
        <div className="col-sm-6">
          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="notificationsCheck"
              checked={user.notifications}
              onChange={handelNofitifcationsChange}
            />
            <label className="form-check-label" htmlFor="notificationsCheck">
              {t("profile.toggle.notifications", "Receive automated notifications via e-mail")}
            </label>
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="allowPrivateMessagesCheck"
              checked={user.allowPrivateMessages}
              onChange={handelAllowPrivateMessagesChange}
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
  );
}

function ProfileSection() {
  const { t } = useTranslation();
  const user = useUser();

  if (!user) {
    return null;
  }

  const editableNameAttr: EditableProps = {
    text: user.username,
    multiline: false,
    placeholder: t("profile.name.placeholder", "Username"),

    store: {
      serverValidationErrors: [
        {
          type: "noUserName",
          message: () => t("warning.noUserName", "Please enter a name for your user."),
        },
        {
          type: "notAllowedCharacter",
          message: () =>
            t("register.warning.notAllowedCharacter", undefined, {
              CHARACTERS: NotAllowedCharacter.join(", "),
            }),
        },
        {
          type: "userExists",
          message: () =>
            t("warning.userExists", "This username is already in use. Please choose another one."),
        },
        {
          type: "nameError",
          message: () => t("update.username.failed", "Could not update username."),
        },
      ],
      onSave: async (newName) => {
        await usersMethods.updateUsername(newName || "");
      },
      onSuccess: () => {
        Alert.success(t("profile.updated", "Updated profile"));
      },
    },
  };
  const editableDescriptionAttr: EditableProps = {
    text: user.description,
    multiline: true,
    placeholder: t(
      "profile.description.placeholder",
      "About you. Let the community know what your interests are.",
    ),
    store: {
      onSave: async (newDescription) => {
        await usersMethods.updateDescription(newDescription || "");
      },
      onSuccess: () => {
        Alert.success(t("profile.updated", "Updated profile"));
      },
    },
  };

  return (
    <div className="page-component">
      <div className="row g-3">
        <div className="col-6 col-sm-3">
          <AvatarForm />
        </div>

        <div className="col-sm-9">
          <h2 className="mt-4">
            <Editable {...editableNameAttr} />
          </h2>
          <p>
            <Editable {...editableDescriptionAttr} />
          </p>
          <a className="btn btn-primary" href={Router.path("userprofile", { _id: user._id })}>
            <span className="fa-solid fa-user fa-fw" aria-hidden="true"></span>{" "}
            {t("login.frame.profile", "Public profile")}
          </a>
        </div>
      </div>
    </div>
  );
}

function CreateUserSection({ user }: { user: UserModel }) {
  const { t } = useTranslation();
  return (
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
        href={Router.path("resetPasswortEmail", { email: user.emailAddress() })}
      >
        {t("profile.createUser.button", "Send me an account creation email")}
      </a>
    </div>
  );
}

function DangerZoneSection() {
  const { t } = useTranslation();
  const [changingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const user = useUser();

  const [isBusy, setIsBusy] = useState(false);

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

  async function handelChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const old = oldPassword;
    const pass = newPassword;
    if (pass !== "") {
      if (pass !== newPasswordConfirm) {
        Alert.warning(t("profile.passwordMismatch", "Sorry, your new passwords don't match"));
        return;
      }
      const minLength = 5; // We've got _some_ standards
      if (pass.length < minLength) {
        Alert.warning(t("profile.passwordShort", "Your desired password is too short. Sorry."));
        return;
      }
      setIsBusy(true);
      try {
        await AccountsAsync.changePassword(old, pass);

        Alert.success(t("profile.passwordChangedSuccess", "You have changed your password."));
        setChangingPassword(false);
      } catch (err) {
        Alert.serverError(err, t("profile.passwordChangeError", "Could not change your password"));
      } finally {
        setIsBusy(false);
      }
    }
  }

  return (
    <div className="page-component page-component-seperated">
      <h3>{t("profile.danger_zone", "Danger zone")}</h3>

      {!isVisitor() && (
        <div className="mb-3">
          {!changingPassword ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setChangingPassword(true)}
            >
              {t("profile.changePass", "Change my password")}
            </button>
          ) : (
            <div className="border border-success text-primary p-3">
              <form onSubmit={handelChangePassword}>
                <div className="row mb-2">
                  <label htmlFor="oldpassword" className="col-sm-4 col-form-label text-end">
                    {t("profile.input.oldPassword", "Your current password")}
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="password"
                      className="form-control"
                      id="oldpassword"
                      value={oldPassword}
                      onChange={(event) => {
                        setOldPassword(event.currentTarget.value);
                      }}
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
                      className="form-control"
                      id="newpassword"
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(event.currentTarget.value);
                      }}
                    />
                  </div>
                </div>
                <div className="row mb-2">
                  <label htmlFor="newpassword_confirm" className="col-sm-4 col-form-label text-end">
                    {t("profile.input.repeatPassword", "Repeat new password")}
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="password"
                      className="form-control"
                      id="newpassword_confirm"
                      value={newPasswordConfirm}
                      onChange={(event) => {
                        setNewPasswordConfirm(event.currentTarget.value);
                      }}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <ButtonSubmit isBusy={isBusy} />
                  <ButtonCancel
                    onClick={() => {
                      setChangingPassword(false);
                    }}
                    disabled={isBusy}
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <span>
        <DeleteConfirm {...deleteConfirmAttr()} />
      </span>
    </div>
  );
}

function Appearance() {
  const { t } = useTranslation();
  const user = useUser();

  if (!user) {
    return null;
  }

  async function handelThemeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    routerAutoscroll.cancelNext();

    try {
      const theme = event.currentTarget.value as any;
      await usersMethods.updateTheme(theme);
      Theme.setTheme(theme);
      Alert.success(t("profile.updated", "Updated profile"));
    } catch (err) {
      Alert.serverError(
        err,
        t("profile.appearance.theme.changeTheme.error", "Failed to change theme"),
      );
    }
  }

  return (
    <>
      <div className="page-component page-component-seperated">
        <h3>{t("profile.appearance.title", "Appearance")}</h3>

        <div className="mb-3">
          <select className="form-select w-auto" value={user.theme} onChange={handelThemeChange}>
            <option value="light">{t("profile.apperance.theme.light", "Light theme")}</option>
            <option value="system">
              {t("profile.apperance.theme.system", "Sync theme with system")}
            </option>
            <option value="dark">{t("profile.apperance.theme.dark", "Dark theme")}</option>
          </select>
        </div>
      </div>
    </>
  );
}

function NotLoggedIn() {
  const { t } = useTranslation();
  return (
    <>
      <h4 className="mt-5">{t("profile.not_logged_in", "You are not logged in")}</h4>
      <button
        className="btn btn-success"
        onClick={() => {
          Session.set("pleaseLogin", true);
        }}
      >
        {t("login.unlogged", "Log in")}
      </button>
    </>
  );
}

function LoggedIn({ user }: { user: UserModel }) {
  const [tenantsAreLoading, tenants] = Tenants.useFindFilter({ adminOf: true });
  const [venuesAreLoading, venues] = Venues.useFindFilter({ editor: user._id });
  const [groupsAreLoading, groups] = Groups.useFindFilter({ own: true });

  function isVisitor() {
    return !!user?.privileged("visitor");
  }
  function isAdmin() {
    return user.privileged("admin");
  }
  function hasTenants() {
    return user.tenants.length > 0;
  }

  return (
    <>
      <ProfileSection />
      <Appearance />
      {!isVisitor() ? (
        <>
          {!!user.emailAddress() && <EmailSection />}
          {isAdmin() && <AdminSection />}
          {!tenantsAreLoading() && hasTenants() && <TenantSection tenants={tenants} />}
          {!groupsAreLoading() && <GroupSection groups={groups} />}
          {!venuesAreLoading() && <VenuesSection venues={venues} />}
        </>
      ) : (
        <CreateUserSection user={user} />
      )}

      <DangerZoneSection />
    </>
  );
}

export function ProfilePage() {
  const { t } = useTranslation();

  const user = useUser();

  function isVisitor() {
    return !!user?.privileged("visitor");
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
      <UnsubscribeResultAlerts />
      {!isVisitor() && (
        <div className="page-component">
          <h1>
            <span className="fa-solid fa-gears fa-fw" aria-hidden="true"></span>{" "}
            {t("login.frame.settings")}
          </h1>
        </div>
      )}
      {!user ? <NotLoggedIn /> : <LoggedIn user={user} />}
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("ProfilePage", () => ProfilePage);
