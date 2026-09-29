import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSessionEquals } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";

import MediumEditor from "medium-editor";

import "./styles.scss";

export interface Props {
  className?: string | undefined;
  text?: string | undefined;
  placeholder?: string | undefined;
  maxLength?: number | undefined;
  onChange?: ((value: string, numberOfCharacters: number) => void) | undefined;
}

export function Richtext({ className, text, placeholder, maxLength, onChange }: Props) {
  const { t } = useTranslation();
  const elementRef = useRef<HTMLDivElement>(null);
  const [numberOfCharacters, setNumberOfCharacters] = useState(0);
  const isRTL = useSessionEquals("textDirectionality", "rtl");

  function characterLimitReached() {
    if (!maxLength) {
      return false;
    }
    return numberOfCharacters > maxLength;
  }
  function removeNumberOfCharacters() {
    if (!maxLength) {
      return 0;
    }
    return numberOfCharacters - maxLength;
  }

  function handleChange(
    event:
      | React.ChangeEvent<HTMLDivElement>
      | React.InputEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>,
  ) {
    const element = event.currentTarget;

    let value = "";
    if (element.innerText.trim()) {
      value = element.innerHTML;
    } else {
      // Fix placeholder position on empty after change
      element.innerHTML = "";
    }
    // Get the number of visible characters
    setNumberOfCharacters(element.innerText.trim().length);

    onChange?.(value, element.innerText.trim().length);
  }

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }
    if (elementRef.current.innerHTML !== text) {
      elementRef.current.innerHTML = text || "";
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

    setNumberOfCharacters(elementRef.current.innerText.trim().length);
  }, [text, placeholder, t, isRTL]);

  return (
    <>
      <div
        className={cx("richtext form-control", characterLimitReached() && "is-invalid", className)}
        ref={elementRef}
        onKeyUp={handleChange}
        onChange={handleChange}
        onInput={handleChange}
      ></div>
      {characterLimitReached() && (
        <div className="invalid-feedback">
          {t("_inputField.maxlength", { NUMBER: removeNumberOfCharacters(), MAXNUMBER: maxLength })}
        </div>
      )}
    </>
  );
}
