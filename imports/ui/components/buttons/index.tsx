import React, { useState } from "react";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { useTranslation } from "react-i18next";
import { PleaseLogin } from "../please-login";

import "/imports/ui/components/buttons";

export function ActionButton({
  className,
  disabled,
  needsLogin,
  onClick,
  children,
  busyText,
}: {
  className?: string | undefined;
  disabled?: boolean | undefined;
  /** Login the user before triggering onClick. */
  needsLogin?: boolean | undefined;
  onClick: () => Promise<void>;
  children: any;
  busyText?: string | undefined;
}) {
  const [isBusy, setIsBusy] = useState(false);

  const attributes = {
    type: "button" as const,
    className: `${className} text-nowrap`,
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
    <>
      {!isBusy ? (
        children
      ) : (
        <>
          <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
          {busyText}
        </>
      )}
    </>
  );

  if (needsLogin) {
    return <PleaseLogin {...attributes}>{content}</PleaseLogin>;
  }
  return <button {...attributes}>{content}</button>;
}

export function Button({
  className,
  disabled,
  onClick,
  children,
  busyText,
}: {
  className?: string | undefined;
  disabled?: boolean | undefined;
  onClick: (event: { preventDefault: () => void }) => Promise<void>;
  children: any;
  busyText?: string | undefined;
}) {
  const [isBusy, setIsBusy] = useState(false);

  return (
    <button
      type="button"
      className={`${className} text-nowrap`}
      disabled={isBusy || disabled}
      onClick={async (event) => {
        setIsBusy(true);
        try {
          await onClick(event);
        } finally {
          setIsBusy(false);
        }
      }}
    >
      {!isBusy ? (
        children
      ) : (
        <>
          <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
          {busyText}
        </>
      )}
    </button>
  );
}

export function ButtonSave(props: {
  className?: string;
  disabled?: boolean | undefined;
  children?: any;
  onClick: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <PleaseLogin
      type="button"
      className={`btn btn-save text-nowrap ${props.className || ""}`}
      onClick={props.onClick}
      disabled={props.disabled}
      busyText={t("_button.saving", "Saving…")}
    >
      {props.children || t("_button.save")}
    </PleaseLogin>
  );
}

export function ButtonSubmit(props: {
  disabled?: boolean | undefined;
  isBusy?: boolean | undefined;
}) {
  const { t } = useTranslation();
  return (
    <button
      data-test="button-submit"
      type="submit"
      className="btn btn-cancel text-nowrap"
      disabled={props.disabled}
    >
      {!props.isBusy ? (
        t("_button.save")
      ) : (
        <>
          <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
          {t("_button.saving", "Saving…")}
        </>
      )}
    </button>
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
  onClick,
  disabled,
  children,
  busyText,
}: {
  onClick: () => Promise<void>;
  disabled?: boolean | undefined;
  children?: any;
  busyText?: string | undefined;
}) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);

  busyText = busyText || t("_button.deleting");

  return (
    <PleaseLogin
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
          <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
          {busyText}
        </>
      )}
    </PleaseLogin>
  );
}

// for Blaze

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"button", Record<string, string>>;

const template = Template.button;

template.helpers({
  attributes() {
    const instance = Template.instance();

    const attributes = { ...instance.data };

    return { ...attributes };
  },
});
