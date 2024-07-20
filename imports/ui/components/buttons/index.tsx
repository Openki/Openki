import React from "react";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { useTranslation } from "react-i18next";

import "/imports/ui/components/buttons";

export function ButtonSave(props: {
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  disabled?: boolean | undefined;
  isBusy?: boolean | undefined;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="btn btn-save text-nowrap"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {!props.isBusy ? t("_button.save") : t("_button.saving", "Saving…")}
    </button>
  );
}

export function ButtonCancel(props: {
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  disabled?: boolean | undefined;
}) {
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

export function ButtonDelete(props: {
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  disabled?: boolean | undefined;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="btn btn-delete text-nowrap text-danger"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {t("_button.delete")}
    </button>
  );
}

// for Blaze
// eslint-disable-next-line import/first
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
