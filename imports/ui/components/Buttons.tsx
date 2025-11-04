import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { PleaseLogin } from "./please-login";

import { buildSizeClass, Size } from "../lib/buildSizeClass";

interface CommonProps {
  /** needed to identify for testing */
  id: string;
  className?: string | undefined;
  size?: Size;
  block?: boolean | undefined;
  disabled?: boolean | undefined;
  children: ReactNode;
  busyText?: string | undefined;
}

type LoginProps = CommonProps & {
  /**
   * Login the user before triggering onClick.
   *
   * If this button is part of a form, consider using “submit” for reasons of semantic
   * correctness for accessibility and the full use of the browser default behavior.
   */
  needsLogin?: boolean | undefined;
  onClick: () => Promise<void>;
};

type SubmitProps = CommonProps & {
  submit: true;
  isBusy: boolean;
};

type Props = LoginProps | SubmitProps;

function Content({
  isBusy,
  busyText,
  children,
}: {
  isBusy?: boolean | undefined;
  busyText?: string | undefined;
  children: ReactNode;
}) {
  return (
    <>
      {!isBusy ? (
        children
      ) : (
        <>
          <i className="fa-solid fa-circle-notch fa-spin fa-fw" /> {busyText}
        </>
      )}
    </>
  );
}

function ControlledButton({
  id,
  className,
  disabled,
  needsLogin,
  onClick,
  children,
  busyText,
}: LoginProps) {
  const [isBusy, setIsBusy] = useState(false);

  const commonProps = {
    id,
    type: "button" as const,
    className,
    disabled: isBusy || disabled,
    onClick: async () => {
      setIsBusy(true);
      try {
        await onClick();
      } finally {
        setIsBusy(false);
      }
    },
  };

  const content = (
    <Content isBusy={isBusy} busyText={busyText}>
      {children}
    </Content>
  );

  return needsLogin ? (
    <PleaseLogin {...commonProps}>{content}</PleaseLogin>
  ) : (
    <button {...commonProps}>{content}</button>
  );
}

export function Button(props: Props) {
  const { id, className, size, block, disabled, children, busyText } = props;

  const fullClassName = ["btn", buildSizeClass("btn", size), "text-nowrap", className].join(" ");

  const button =
    "onClick" in props ? (
      <ControlledButton {...props} className={fullClassName} />
    ) : (
      <button id={id} type="submit" className={fullClassName} disabled={props.isBusy || disabled}>
        <Content isBusy={props.isBusy} busyText={busyText}>
          {children}
        </Content>
      </button>
    );

  if (block) {
    return <div className="d-grid">{button}</div>;
  }

  return button;
}

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
  disabled,
  isBusy,
}: {
  disabled?: boolean | undefined;
  isBusy: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Button
      id="button-submit"
      submit
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

export function ButtonCancel(props: { onClick: () => void; disabled?: boolean | undefined }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="btn btn-cancel text-nowrap"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {t("_button.cancel")}
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
