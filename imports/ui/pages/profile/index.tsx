import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import { UserModel } from "/imports/api/users/users";
import * as Tenants from "/imports/api/tenants/publications";
import * as Venues from "/imports/api/venues/publications";
import * as Groups from "/imports/api/groups/publications";

import * as Analytics from "/imports/ui/lib/analytics";
import * as Metatags from "/imports/utils/metatags";

import { Appearance } from "./Appearance";
import { DangerZoneSection } from "./DangerZoneSection";
import { CreateUserSection } from "./CreateUserSection";
import { ProfileSection } from "./ProfileSection";
import { EmailSection } from "./EmailSection";
import { VenuesSection } from "./VenuesSection";
import { GroupSection } from "./GroupSection";
import { TenantSection } from "./TenantSection";
import { AdminSection } from "./AdminSection";

import "./styles.scss";

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
