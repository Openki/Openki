import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import React from "react";
import { useTranslation } from "react-i18next";
import { useUserId } from "/imports/ui/hooks/react-meteor-data";

import "./styles.scss";

export function EventNotFound() {
  const { t } = useTranslation();
  const currentUser = useUserId();

  if (currentUser) {
    return (
      <h3 className="event-notfound-text px-3">
        {t(
          "event.not_exists",
          "Could not find this event. Maybe it was deleted, or never existed in the first place.",
        )}
      </h3>
    );
  }
  return (
    <div className="event-notfound-text px-3">
      <h3>{t("user.not.logged_in", "Could not find this event. Maybe you must log in?")}</h3>
      <button
        className="btn btn-save"
        onClick={() => {
          Session.set("pleaseLogin", true);
        }}
      >
        <i className="fa-solid fa-right-to-bracket fa-fw" />{" "}
        <span>{t("event.not_exists.unlogged", "Log in/register")}</span>
      </button>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("EventNotFound", () => EventNotFound);
