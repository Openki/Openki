import { useTranslation } from "react-i18next";
import React from "react";
import { Template } from "meteor/templating";

import "./styles.scss";

export function LoadingPage() {
  const { t } = useTranslation();

  return (
    <div className="loading-page">
      <h1>
        <span
          className="fa-solid fa-circle-notch fa-spin fa-fw"
          aria-hidden="true"
          title={t("loading.loading")}
        ></span>
        {t("loading.loading", "Loading…")}
      </h1>
    </div>
  );
}

export function LoadingRow() {
  const { t } = useTranslation();

  return (
    <div className="loading-row">
      <h1>
        <span
          className="fa-solid fa-circle-notch fa-spin fa-fw"
          aria-hidden="true"
          title={t("loading.loading")}
        ></span>
        <span className="sr-only">{t("loading.loading")}</span>
        {t("loading.loading")}
      </h1>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("LoadingPage", () => LoadingPage);
Template.registerHelper("LoadingRow", () => LoadingRow);
