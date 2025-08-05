import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { PublicSettings } from "/imports/utils/PublicSettings";

export function AdminSection() {
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
