import { useTranslation } from "react-i18next";
import React from "react";
import { Template } from "meteor/templating";

import "./styles.scss";

export function LoadingPage() {
  const { t } = useTranslation();

  return (
    <div className="loading-page">
      <h1>
        <i className="fa-solid fa-circle-notch fa-spin fa-fw" title={t("loading.loading")} />
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
        <i className="fa-solid fa-circle-notch fa-spin fa-fw" title={t("loading.loading")} />{" "}
        {t("loading.loading")}
      </h1>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("LoadingPage", () => LoadingPage);
Template.registerHelper("LoadingRow", () => LoadingRow);
