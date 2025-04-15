import React, { useState } from "react";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { useTranslation } from "react-i18next";
import { PleaseLogin } from "../please-login";

import "/imports/ui/components/buttons";

export function Button({
  className,
  onClick,
  children,
}: {
  className: string;
  onClick: () => Promise<void>;
  children: any;
}) {
  const [isBusy, setIsBusy] = useState(false);

  return (
    <button
      type="button"
      className={`${className} text-nowrap`}
      disabled={isBusy}
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
        children
      ) : (
        <>
          <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
        </>
      )}
    </button>
  );
}

export function ButtonSave(props: {
  onClick: () => void;
  disabled?: boolean | undefined;
  isBusy?: boolean | undefined;
}) {
  const { t } = useTranslation();
  return (
    <PleaseLogin
      type="button"
      className="btn btn-save text-nowrap"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {!props.isBusy ? (
        t("_button.save")
      ) : (
        <>
          <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
          {t("_button.saving", "Saving…")}
        </>
      )}
    </PleaseLogin>
  );
}

export function ButtonSubmit(props: {
  disabled?: boolean | undefined;
  isBusy?: boolean | undefined;
}) {
  const { t } = useTranslation();
  return (
    <button type="submit" className="btn btn-cancel text-nowrap" disabled={props.disabled}>
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

export function ButtonDelete(props: { onClick: () => void; disabled?: boolean | undefined }) {
  const { t } = useTranslation();
  return (
    <PleaseLogin
      type="button"
      className="btn btn-delete text-nowrap text-danger"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {t("_button.delete")}
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
