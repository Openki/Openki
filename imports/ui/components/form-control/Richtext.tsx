import React, { FocusEventHandler, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSession, useSessionEquals } from "/imports/ui/hooks/react-meteor-data";

import MediumEditor from "medium-editor";
import { cx } from "/imports/utils/cx";

export interface Props {
  id?: string | undefined;
  className?: string | undefined;
  placeholder?: string | undefined;
  value?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  onChange?:
    | ((
        /** string with html content */ value: string,
        /** number of visible characters */ numberOfCharacters: number,
      ) => void)
    | undefined;
  onFocus: FocusEventHandler<HTMLElement> | undefined;
  onBlur: FocusEventHandler<HTMLElement> | undefined;
  "aria-labelledby": string | undefined;
  "aria-describedby": string | undefined;
  "aria-invalid": boolean;
}

export function Richtext(props: Props) {
  const { id, className, placeholder, disabled, value, required, onChange, onFocus, onBlur } =
    props;
  const { t } = useTranslation();
  const elementRef = useRef<HTMLDivElement>(null);
  const isRTL = useSessionEquals("textDirectionality", "rtl");
  const locale = useSession("locale");

  function handleChange(event: React.KeyboardEvent<HTMLDivElement>) {
    const element = event.currentTarget;

    let value = "";
    if (element.innerText.trim()) {
      value = element.innerHTML;
    } else {
      // Fix placeholder position on empty after change
      element.innerHTML = "";
    }

    onChange?.(value, element.innerText.trim().length);
  }

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }
    if (elementRef.current.innerHTML !== value) {
      elementRef.current.innerHTML = value || "";
    }
  }, [value]);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    if (disabled) {
      return;
    }

    const align = !isRTL ? "left" : "right";

    const meOptions: MediumEditor.CoreOptions = {
      toolbar: {
        align,
        updateOnEmptySelection: true,
        // list of supported html tags / formatting. Should be same as in the saneHtml(...) function
        buttons: ["h4", "bold", "italic", "underline", "anchor", "unorderedlist", "orderedlist"],
      },
      disableDoubleReturn: true,
      placeholder: {
        hideOnClick: false,
        text: placeholder || t("richtext.placeholder.default", "Type your text"),
      },
      anchor: {
        linkValidation: true,
        placeholderText: t("richtext.link.placeholder", "Paste or type a link"),
      },
      autoLink: true,
      buttonLabels: "fontawesome",
    };

    // Make titles translateable
    const meExtensions = (MediumEditor as any).extensions;

    const meButton = meExtensions.button.prototype.defaults;
    meButton.h4.aria = t("richtext.button.h4.title", "subheader");
    meButton.h4.contentFA = '<i class="fa fa-header">';
    meButton.bold.aria = t("richtext.button.bold.title", "bold");
    meButton.italic.aria = t("richtext.button.italic.title", "italic");
    meButton.underline.aria = t("richtext.button.underline.title", "underline");
    meButton.unorderedlist.aria = t("richtext.button.unorderedlist.title", "unordered list");
    meButton.orderedlist.aria = t("richtext.button.orderedlist.title", "ordered list");

    meExtensions.anchor.prototype.aria = t("richtext.button.anchor.title", "link");

    // Initialize the editor interface
    const mediumEditor = new MediumEditor(elementRef.current, meOptions);

    mediumEditor.subscribe("editableInput", handleChange);

    return () => {
      mediumEditor.destroy();
    };
  }, [placeholder, locale, isRTL, disabled]);

  return (
    <div
      id={id}
      className={cx("form-control", className, disabled && "bg-secondary")}
      style={{ minHeight: "100px" }}
      ref={elementRef}
      onFocus={!disabled ? onFocus : undefined}
      onBlur={!disabled ? onBlur : undefined}
      // for accessibility
      aria-labelledby={props["aria-labelledby"]}
      aria-describedby={props["aria-describedby"]}
      role="textbox"
      aria-multiline="true"
      aria-disabled={disabled}
      aria-invalid={props["aria-invalid"]}
      aria-required={required}
    />
  );
}
