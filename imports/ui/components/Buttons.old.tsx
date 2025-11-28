import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { PleaseLogin } from "./please-login";

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

export function ButtonEdit(props: { onClick: () => void; disabled?: boolean | undefined }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="btn btn-edit text-nowrap"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {t("_button.edit")}
    </button>
  );
}
export function ButtonDelete({
  id,
  onClick,
  disabled,
  children,
  busyText,
}: {
  id: string;
  onClick: () => Promise<void>;
  disabled?: boolean | undefined;
  children?: ReactNode;
  busyText?: string | undefined;
}) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);

  busyText = busyText || t("_button.deleting");

  return (
    <PleaseLogin
      id={id}
      type="button"
      className="btn btn-delete text-nowrap text-danger"
      disabled={isBusy || disabled}
      onClick={async () => {
        setIsBusy(true);
        try {
          await onClick();
        } finally {
          setIsBusy(false);
        }
      }}
    >
      {!isBusy ? (
        children || t("_button.delete")
      ) : (
        <>
          <i className="fa-solid fa-circle-notch fa-spin fa-fw" /> {busyText}
        </>
      )}
    </PleaseLogin>
  );
}
