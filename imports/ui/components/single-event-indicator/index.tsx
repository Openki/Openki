import { useTranslation } from "react-i18next";

import "./styles.scss";

export function SingleEventIndicator() {
  const { t } = useTranslation();
  return <span className="single-event-indicator" data-bs-title={t("_label.singleEvent")}></span>;
}
