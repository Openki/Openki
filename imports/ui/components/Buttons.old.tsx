import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Size } from "../lib/buildSizeClass";
import { Button } from "/imports/ui/components/Buttons";

export function ButtonSave(props: {
  id: string;
  className?: string;
  disabled?: boolean | undefined;
  children?: ReactNode;
  onClick: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <Button
      id={props.id}
      className={`btn-save ${props.className || ""}`}
      needsLogin
      onClick={props.onClick}
      disabled={props.disabled}
      busyText={t("_button.saving", "Saving…")}
    >
      {props.children || t("_button.save")}
    </Button>
  );
}

export function ButtonSubmit({
  size,
  block,
  disabled,
  isBusy,
}: {
  size?: Size | undefined;
  block?: boolean | undefined;
  disabled?: boolean | undefined;
  isBusy: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Button
      id="button-submit"
      submit
      size={size}
      block={block}
      className="btn-cancel"
      disabled={disabled}
      busyText={t("_button.saving", "Saving…")}
      isBusy={isBusy}
    >
      {t("_button.save")}
    </Button>
  );
}
