import { Router } from "meteor/iron:router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import * as Organizations from "/imports/api/organizations/publications";
import * as Tenants from "/imports/api/tenants/publications";
import { UserModel } from "/imports/api/users/users";
import * as Venues from "/imports/api/venues/publications";
import { useHasVerifiedEmail } from "/imports/api/users/publications";

import * as Analytics from "/imports/ui/lib/analytics";
import { MetaTags } from "/imports/ui/components/MetaTags";

import { ActionResult } from "../../components/ActionResult";
import { AdminSection } from "./AdminSection";
import { Appearance } from "./Appearance";
import { CalendarSection } from "./CalendarSection";
import { CreateUserSection } from "./CreateUserSection";
import { AccountManagementSection } from "./AccountManagementSection";
import { EmailSection } from "./EmailSection";
import { OrganizationSection } from "./OrganizationSection";
import { ProfileSection } from "./ProfileSection";
import { TenantSection } from "./TenantSection";
import { VenuesSection } from "./VenuesSection";
import { Report } from "/imports/ui/components/report";

import "./styles.scss";

function VisitProfileAction({ color }: { color: string }) {
  const { t } = useTranslation();
  return (
    <a className={`btn btn-lg btn-${color}`} href={Router.path("profile")}>
      {t("profile.gotoProfile", "Visit your profile")}
    </a>
  );
}

function VerifyEmailAlerts() {
  const { t } = useTranslation();
  const query = useSearchParams();

  const [isLoading, hasVerifiedEmail] = useHasVerifiedEmail({ when: !!query.email }, query.email);

  if (query.verifyEmail === "success") {
    return (
      <ActionResult
        type="success"
        title={t("profile.verifyEmail.success", "Your e-mail has been verified.")}
        actions={[{ button: <VisitProfileAction key={1} color="success" /> }]}
      />
    );
  }

  if (query.verifyEmail === "failed") {
    if (isLoading()) {
      return null;
    }

    if (hasVerifiedEmail?.verified) {
      // email was already verified by the user
      return (
        <ActionResult
          type="success"
          title={t("profile.verifyEmail.success", "Your e-mail has been verified.")}
          actions={[{ button: <VisitProfileAction key={1} color="success" /> }]}
        >
          {t(
            "profile.verifyEmail.success.btw",
            "By the way: Your email address had already been verified previously.",
          )}
        </ActionResult>
      );
    }

    return (
      <ActionResult
        type="failed"
        title={t("profile.verifyEmail.failed", "Address could not be verified. Please Try again.")}
        actions={[{ button: <VisitProfileAction key={1} color="secondary" /> }]}
      />
    );
  }

  throw new Error("Unexpected value for verifyEmail param.");
}

function UnsubscribeResultAlerts() {
  const { t } = useTranslation();
  const query = useSearchParams();

  function notificationsUnsubscribeSuccess() {
    return query.unsubscribed === "notifications";
  }
  function privateMessagesUnsubscribeSuccess() {
    return query.unsubscribed === "privatemessages";
  }
  function unsubscribeError() {
    return query["unsubscribe-error"] === "";
  }

  useEffect(() => {
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
  }, [query.unsubscribe]);

  if (notificationsUnsubscribeSuccess()) {
    return (
      <ActionResult
        type="success"
        icon={
          <span className="fa-stack fa-2xs">
            <i className="fa-regular fa-envelope fa-stack-1x" />
            <i className="fa-solid fa-ban fa-stack-2x" />
          </span>
        }
        title={t(
          "notifications.unsubscribeSuccess",
          "You have successfully unsubscribed from all automated notifications.",
        )}
        actions={[
          {
            description: t(
              "notifications.unsubscribeSuccess.action",
              "If you want to unsubscribe from a specific group you can unsubscribe there. Manage your notifications settings:",
            ),
            button: <VisitProfileAction color="success" />,
          },
        ]}
      >
        {t(
          "notifications.unsubscribeSuccess.description",
          "Are you sure? This could cause problems. You will not receive notifications about updates to groups, events, etc.",
        )}
      </ActionResult>
    );
  }
  if (privateMessagesUnsubscribeSuccess()) {
    return (
      <ActionResult
        type="success"
        icon={
          <span className="fa-stack fa-2xs">
            <i className="fa-regular fa-envelope fa-stack-1x" />
            <i className="fa-solid fa-ban fa-stack-2x" />
          </span>
        }
        title={t(
          "privateMessages.unsubscribeSuccess",
          "You will not get direct messages from users anymore.",
        )}
        actions={[
          {
            description: t(
              "privateMessages.unsubscribeSuccess.action.manage",
              "Manage your notifications settings:",
            ),
            button: <VisitProfileAction color="success" />,
          },
          {
            description: t(
              "privateMessages.unsubscribeSuccess.action.reportHarassment",
              "Report harassment by another user:",
            ),
            button: <Report />,
          },
        ]}
      >
        {t(
          "privateMessages.unsubscribeSuccess.description",
          "Are you sure? This could cause problems. Other users will no longer be able to contact you.",
        )}
      </ActionResult>
    );
  }

  if (unsubscribeError()) {
    return (
      <ActionResult
        type="failed"
        title={t("notifications.unsubscribeError", "Could not unsubscribe. Please Try again.")}
        actions={[<VisitProfileAction key={1} color="secondary" />]}
      />
    );
  }

  throw new Error('Unexpected value for params "unsubscribed" and "unsubscribe-error".');
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
  const [organizationsAreLoading, organizations] = Organizations.useFindFilter({ own: true });

  function isVisitor() {
    return !!user?.hasPrivilege("visitor");
  }
  function isAdmin() {
    return user.hasPrivilege("admin");
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
          <EmailSection />
          <CalendarSection />
          {isAdmin() && <AdminSection />}
          {!tenantsAreLoading() && hasTenants() && <TenantSection tenants={tenants} />}
          {!organizationsAreLoading() && <OrganizationSection organizations={organizations} />}
          {!venuesAreLoading() && <VenuesSection venues={venues} />}
        </>
      ) : (
        <>
          <CreateUserSection user={user} />
          <CalendarSection />
        </>
      )}
      <AccountManagementSection />
    </>
  );
}

export function ProfilePage() {
  const { t } = useTranslation();
  const query = useSearchParams();
  const user = useUser();

  function isVisitor() {
    return !!user?.hasPrivilege("visitor");
  }

  if (query.unsubscribed || query["unsubscribe-error"] === "") {
    return <UnsubscribeResultAlerts />;
  }

  if (query.verifyEmail) {
    return <VerifyEmailAlerts />;
  }

  const title = t("profile.settings.windowtitle", "My Profile Settings - {USER}", {
    USER: user?.getDisplayName() || "...",
  });

  return (
    <>
      <MetaTags title={title} />

      <div className="container mw-md">
        {!isVisitor() && (
          <div className="page-component">
            <h1 data-test="profile-header">
              <i className="fa-solid fa-gears fa-fw" /> {t("login.frame.settings")}
            </h1>
          </div>
        )}
        {!user ? <NotLoggedIn /> : <LoggedIn user={user} />}
      </div>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("ProfilePage", () => ProfilePage);
