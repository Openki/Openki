import { useTranslation } from "react-i18next";
import { Template } from "meteor/templating";
import React from "react";

import "./styles.scss";

export function SingleEventIndicator() {
  const { t } = useTranslation();
  return (
    <span
      className="single-event-indicator"
      data-bs-toggle="tooltip"
      data-bs-title={t("_label.singleEvent")}
    ></span>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("SingleEventIndicator", () => SingleEventIndicator);
