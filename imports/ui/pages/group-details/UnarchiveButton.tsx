import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Buttons";

export function UnarchiveButton({
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
      busyText={t("group.archive.unarchiveButton.unarchiving", "Unarchiving…")}
    >
      {t("group.archive.unarchiveButton", "Unarchive")}
    </Button>
  );
}
