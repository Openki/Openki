import { Router } from "meteor/iron:router";
import { Session } from "meteor/session";
import { useTranslation } from "react-i18next";
import React from "react";
import { Template } from "meteor/templating";

import "./styles.scss";

function buildBackLink() {
  const routeName = Session.get("kioskRoute");
  const filterParams = Session.get("kioskFilter");
  if (!filterParams) {
    return undefined;
  }

  delete filterParams.region; // HACK region is kept in the session (for bad reasons)
  const queryString = new URLSearchParams(filterParams).toString();

  const options: { query?: string } = {};
  if (queryString.length) {
    options.query = queryString;
  }

  return Router.url(routeName, {}, options);
}

export function KioskLink() {
  const { t } = useTranslation();

  const link = buildBackLink();
  if (link) {
    return (
      <a href={link}>
        <button type="button" className="back-to-kiosk">
          {t("backToKiosk", "Return to overview")}
        </button>
      </a>
    );
  }
  return null;
}

// for Blaze

import "./template.html";

Template.registerHelper("KioskLink", () => KioskLink);
