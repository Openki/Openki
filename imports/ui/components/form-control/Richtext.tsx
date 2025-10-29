import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSessionEquals } from "/imports/utils/react-meteor-data";

import MediumEditor from "medium-editor";

export interface Props {
  id?: string | undefined;
  className?: string | undefined;
  placeholder?: string | undefined;
  value?: string | undefined;
  disabled?: boolean | undefined;
  onChange?:
    | ((
        /** string with html content */ value: string,
        /** number of visible characters */ numberOfCharacters: number,
      ) => void)
    | undefined;
  onBlur: (() => void) | undefined;
  "aria-describedby": string | undefined;
  "aria-invalid": boolean;
}

export function Richtext(props: Props) {
  const { id, className, placeholder, disabled, value, onChange, onBlur } = props;
  const { t } = useTranslation();
  const elementRef = useRef<HTMLDivElement>(null);
  const isRTL = useSessionEquals("textDirectionality", "rtl");

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
    new MediumEditor(elementRef.current, meOptions);
  }, [value, placeholder, t, isRTL, disabled]);

  return (
    <div
      id={id}
      className={`form-control ${className} ${disabled ? "bg-secondary" : ""}`}
      style={{ minHeight: "100px" }}
      ref={elementRef}
      onKeyUp={!disabled ? handleChange : undefined}
      onChange={!disabled ? handleChange : undefined}
      onInput={!disabled ? handleChange : undefined}
      onBlur={!disabled ? () => onBlur?.() : undefined}
      aria-describedby={props["aria-describedby"]}
      aria-invalid={props["aria-invalid"]}
    />
  );
}
