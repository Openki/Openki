import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { cx } from "/imports/utils/cx";
import { buildSizeClass, Size } from "../lib/buildSizeClass";

import { Button as NeedsLoginButton } from "/imports/ui/components/PleaseLogin";

interface CommonProps {
  /** needed to identify for testing */
  id: string;
  className?: string | undefined;
  size?: Size | undefined;
  block?: boolean | undefined;
  disabled?: boolean | undefined;
  busyText?: string | undefined;
}

type LoginProps = {
  onClick: () => Promise<void> | void;
} & (
  | {
      /**
       * Login the user before triggering onClick.
       *
       * If this button is part of a form, consider using “submit” for reasons of semantic
       * correctness for accessibility and the full use of the browser default behavior.
       */
      needsLogin?: false | never;
    }
  | {
      /**
       * Login the user before triggering onClick.
       *
       * If this button is part of a form, consider using “submit” for reasons of semantic
       * correctness for accessibility and the full use of the browser default behavior.
       */
      needsLogin: true;
      /**
       * called before login prompt, return false to not run onClick, eg. when validation fails
       */
      beforeClick?: (() => undefined | boolean) | undefined;
      visitorUserAllowed?: boolean | undefined;
    }
);

interface SubmitProps {
  submit: true;
  isBusy: boolean;
}

type Props = CommonProps & (LoginProps | SubmitProps);

export function Content({
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

function ControlledButton(props: CommonProps & LoginProps & { children: ReactNode }) {
  const { id, className, disabled, needsLogin, onClick, children, busyText, ...additionalProps } =
    props;
  const [isBusy, setIsBusy] = useState(false);

  if (needsLogin) {
    return (
      <NeedsLoginButton
        {...additionalProps}
        id={id}
        type="button"
        className={className}
        disabled={disabled}
        visitorUserAllowed={props.visitorUserAllowed}
        onClick={onClick}
        busyText={busyText}
      >
        {children}
      </NeedsLoginButton>
    );
  }

  return (
    <button
      {...additionalProps}
      id={id}
      type="button"
      className={className}
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
      <Content isBusy={isBusy} busyText={busyText}>
        {children}
      </Content>
    </button>
  );
}

export function Button(props: Props & { children: ReactNode }) {
  const { id, className, size, block, disabled, children, busyText, ...additionalProps } = props;

  const fullClassName = cx("btn", buildSizeClass("btn", size), !block && "text-nowrap", className);

  const button =
    "onClick" in props ? (
      <ControlledButton {...additionalProps} {...props} className={fullClassName} />
    ) : (
      <button
        {...additionalProps}
        id={id}
        type="submit"
        className={fullClassName}
        disabled={props.isBusy || disabled}
      >
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
export function ButtonClose({
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
      className="btn-secondary"
      onClick={onClick}
      disabled={disabled}
    >
      {t("_button.close")}
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

export function ButtonDelete({
  label,
  ...props
}: {
  id: string;
  size?: Size | undefined;
  block?: boolean | undefined;
  disabled?: boolean | undefined;
  label?: string | undefined;
} & (LoginProps | SubmitProps)) {
  const { t } = useTranslation();

  return (
    <Button
      needsLogin
      {...props}
      className="btn-delete text-danger"
      busyText={t("_button.deleting")}
    >
      {label ?? t("_button.delete")}
    </Button>
  );
}

export function ButtonIcon(props: { icon: string; title: string } & Props) {
  const { icon, title, className, ...buttonProps } = props;
  return (
    <Button
      {...buttonProps}
      className={cx(className, "d-inline-flex rounded-circle p-2 m-n2 float-end")}
      aria-label={title}
      data-bs-title={title}
    >
      <i className={icon} />
    </Button>
  );
}
