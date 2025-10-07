import React from "react";
import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { useCurrentRouteName } from "/imports/utils/react-meteor-router";

import "./styles.scss";

function collapse() {
  $(".collapse").collapse("hide");
}

export function UserFrame() {
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
            className="btn btn-secondary form-control"
            href={Router.path("userprofile", currentUser)}
            onClick={() => {
              collapse();
            }}
          >
            <span className="fa-solid fa-user fa-fw" aria-hidden="true"></span>&nbsp;
            {t("login.frame.profile", "Public profile")}
          </a>
        </div>
        <div className="mb-3">
          <a
            className="btn btn-secondary form-control"
            href={Router.path("profile")}
            onClick={() => {
              collapse();
            }}
          >
            <span className="fa-solid fa-gears fa-fw" aria-hidden="true"></span>&nbsp;
            {t("login.frame.settings", "Account settings")}
          </a>
        </div>
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-secondary form-control"
            onClick={(event) => {
              event.preventDefault();
              collapse();
              Meteor.logout();

              if (routeName === "profile") {
                Router.go("userprofile", currentUser);
              }
            }}
          >
            <span className="fa-solid fa-right-from-bracket fa-fw" aria-hidden="true"></span>&nbsp;
            {t("login.logout", "Log out")}
          </button>
        </div>
      </div>
    </div>
  );
}
