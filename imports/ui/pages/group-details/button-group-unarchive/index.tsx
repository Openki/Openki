import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/Buttons";

export function ButtonGroupUnarchive({
  disabled,
  onUnarchive,
}: {
  disabled?: boolean | undefined;
  onUnarchive: () => Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <Button
      id="group-details-group-unarchive"
      disabled={disabled}
      className="btn-primary"
      needsLogin
      onClick={onUnarchive}
      busyText={t("course.archive.unarchiveButton.unarchiving", "Unarchiving…")}
    >
      {t("course.archive.unarchiveButton", "Unarchive")}
    </Button>
  );
}
