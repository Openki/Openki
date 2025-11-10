import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { buildSizeClass, Size } from "../lib/buildSizeClass";

interface CommonProps {
  /** needed to identify for testing */
  id: string;
  className?: string | undefined;
  size?: Size | undefined;
  block?: boolean | undefined;
  disabled?: boolean | undefined;
  children: ReactNode;
  busyText?: string | undefined;
}

interface LoginProps {
  /**
   * If this button is part of a form, consider using “submit” for reasons of semantic
   * correctness for accessibility and the full use of the browser default behavior.
   */
  onClick: () => Promise<void> | void;
}

interface SubmitProps {
  submit: true;
  isBusy: boolean;
}

type Props = CommonProps & (LoginProps | SubmitProps);

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
  onClick,
  children,
  busyText,
}: CommonProps & LoginProps) {
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

  return (
    <button {...commonProps}>
      <Content isBusy={isBusy} busyText={busyText}>
        {children}
      </Content>
    </button>
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

export function ButtonEdit({
  id,
  size,
  block,
  onClick,
  disabled,
}: {
  id: string;
  size?: Size | undefined;
  block?: boolean | undefined;
  onClick: () => void;
  disabled?: boolean | undefined;
}) {
  const { t } = useTranslation();
  return (
    <Button
      id={id}
      block={block}
      size={size}
      className="btn-edit"
      onClick={onClick}
      disabled={disabled}
    >
      {t("_button.edit")}
    </Button>
  );
}
export function ButtonCancel({
  id,
  size,
  block,
  onClick,
  disabled,
}: {
  id: string;
  size?: Size | undefined;
  block?: boolean | undefined;
  onClick: () => void;
  disabled?: boolean | undefined;
}) {
  const { t } = useTranslation();
  return (
    <Button
      id={id}
      block={block}
      size={size}
      className="btn-cancel"
      onClick={onClick}
      disabled={disabled}
    >
      {t("_button.cancel")}
    </Button>
  );
}

export function ButtonSave(
  props: {
    id: string;
    size?: Size | undefined;
    block?: boolean | undefined;
    disabled?: boolean | undefined;
  } & (LoginProps | SubmitProps),
) {
  const { t } = useTranslation();

  return (
    <Button {...props} className="btn-save" busyText={t("_button.saving", "Saving…")}>
      {t("_button.save")}
    </Button>
  );
}

export function ButtonDelete(
  props: {
    id: string;
    size?: Size | undefined;
    block?: boolean | undefined;
    disabled?: boolean | undefined;
  } & (LoginProps | SubmitProps),
) {
  const { t } = useTranslation();

  return (
    <Button {...props} className="btn-delete text-danger" busyText={t("_button.deleting")}>
      {t("_button.delete")}
    </Button>
  );
}
