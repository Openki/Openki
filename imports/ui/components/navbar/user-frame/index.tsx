import React from "react";
import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { useTranslation } from "react-i18next";
import { useCurrentRouteName } from "/imports/ui/hooks/react-meteor-router";

import "./styles.scss";
import { Collapse } from "/imports/startup/client/bootstrap";

export function UserFrame({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const currentUser = useUser();
  const routeName = useCurrentRouteName();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="user-frame">
      <div className="ownuser-frame">
        <div className="mb-3 ownuser-frame-welcome">
          {t("login.frame.welcome", "Welcome {NAME}.", { NAME: currentUser.getDisplayName() })}
        </div>
        <div className="mb-3">
          <a
            className="btn btn-secondary w-100"
            href={Router.path("userprofile", currentUser)}
            onClick={() => {
              onClose();
            }}
          >
            <i className="fa-solid fa-user fa-fw" />
            &nbsp;
            {t("login.frame.profile", "Public profile")}
          </a>
        </div>
        <div className="mb-3">
          <a
            className="btn btn-secondary w-100"
            href={Router.path("profile")}
            onClick={() => {
              onClose();
            }}
          >
            <i className="fa-solid fa-gears fa-fw" />
            &nbsp;
            {t("login.frame.settings", "Account settings")}
          </a>
        </div>
        <div className="mb-3">
          <button
            data-test="navbar-user-frame-logout-button"
            type="button"
            className="btn btn-secondary w-100"
            onClick={(event) => {
              event.preventDefault();
              Collapse.getInstance("#bs-navbar-collapse")?.hide();
              Meteor.logout();

              if (routeName === "profile") {
                Router.go("userprofile", currentUser);
              }
            }}
          >
            <i className="fa-solid fa-right-from-bracket fa-fw" />
            &nbsp;
            {t("login.logout", "Log out")}
          </button>
        </div>
      </div>
    </div>
  );
}
