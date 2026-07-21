import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/Buttons";

export function ArchiveButton({
  className,
  disabled,
  onArchive,
  children,
}: {
  className: string;
  disabled?: boolean | undefined;
  onArchive: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <Button
      id="group-details-group-archive"
      className={className}
      disabled={disabled}
      needsLogin
      onClick={onArchive}
      busyText={t("group.archive.archiveButton.archiving", "Archiving…")}
    >
      {children}
    </Button>
  );
}
