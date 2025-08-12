import { useTranslation } from "react-i18next";
import React from "react";

import "./styles.scss";

export function InternalIndicator() {
  const { t } = useTranslation();
  return <span className="internal-indicator" data-bs-title={t("_label.internal")}></span>;
}
