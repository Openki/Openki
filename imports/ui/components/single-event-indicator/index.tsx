import { useTranslation } from "react-i18next";
import React from "react";

import "./styles.scss";

export function SingleEventIndicator() {
  const { t } = useTranslation();
  return <span className="single-event-indicator" data-bs-title={t("_label.singleEvent")}></span>;
}
