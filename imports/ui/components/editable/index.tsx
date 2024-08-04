/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ValidationError, ValidationErrorDetail } from "meteor/mdg:validation-error";
import MediumEditor from "medium-editor";
import { Mapping, useValidation } from "../../lib/useValidation";
import { useSessionEquals } from "../../../utils/react-meteor-data";
import { ButtonSave, ButtonCancel } from "../../components/buttons";
import { Store } from "../../lib/editable";

import "./styles.scss";

export type Props = {
  text: string;
  multiline?: boolean;
  placeholderText?: string;
  maxlength?: number | undefined;
  onChange?: (
    newText: string | undefined,
    numberOfCharacters: number,
    totalFocusTimeInSeconds: number,
  ) => void;
  store?: Store | undefined;
};

export function Editable(data: Props) {
  const { t } = useTranslation();
  const [numberOfCharacters, setNumberOfCharacters] = useState(0);
  const [changed, setChanged] = useState(!data.store);

  const [initialized, setInitialized] = useState(false);
  const [changedByUser, setChangedByUser] = useState(false);
  const [totalFocusTimeInSeconds, setTotalFocusTimeInSeconds] = useState(0);
  const [startGettingFocus, setStartGettingFocus] = useState<number | undefined>(undefined);

  const elementRef = useRef<HTMLDivElement>(null);

  const getEdited = () => {
    if (!changed) {
      return undefined;
    }
    const element = elementRef.current;
    if (!element) {
      return undefined;
    }
    return data.multiline ? element.innerHTML.trim() : element.innerText.trim();
  };

  // Add error mapping for the FormfieldErrors
  const errorMapping: Mapping = {};
  const clientValidations = data.store?.clientValidations;
  if (clientValidations) {
    Object.entries(clientValidations).forEach(([key, validation]) => {
      errorMapping[key] = {
        text: validation.errorMessage,
        field: "input",
      };
    });
  }
  data.store?.serverValidationErrors?.forEach((e) => {
    errorMapping[e.type] = {
      text: e.message,
      field: "input",
    };
  });

  const [errors, checkValidity, addError, resetErrors] = useValidation(errorMapping);

  const isRTL = useSessionEquals("textDirectionality", "rtl");
  const align = !isRTL ? "left" : "right";

  function characterLimitReached() {
    if (!data.maxlength) {
      return false;
    }

    return numberOfCharacters > data.maxlength;
  }
  function removeNumberOfCharacters() {
    if (!data.maxlength) {
      return 0;
    }

    return numberOfCharacters - data.maxlength;
  }
  function showControls() {
    return !!data.store && changed;
  }
  function wrapClasses() {
    return data.multiline ? "editable-wrap-multiline" : "editable-wrap-singleline";
  }
  function editableClasses() {
    const classes: string[] = [];

    if (changed) {
      classes.push("editable-changed");
    }

    if (!data.store) {
      classes.push("form-control");
    }

    return classes.join(" ");
  }

  const reset = () => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const text = data.text;

    if (data.multiline) {
      element.innerHTML = text;
    } else {
      element.innerText = text;
    }

    // HACK remove placeholder when there is content
    // We should be using setContent() anyway, but it's not defined?!
    if (text) {
      element.classList.remove("medium-editor-placeholder", "medium-editor-placeholder-relative");
    }

    resetErrors();
  };

  const store = async () => {
    const newText = getEdited();
    if (newText === undefined) {
      // Nothing has changed
      return;
    }
    try {
      await data.store?.onSave?.(newText);

      setChanged(false);

      setChangedByUser(false);
      setStartGettingFocus(undefined);
      setTotalFocusTimeInSeconds(0);

      data.store?.onSuccess?.(newText);
    } catch (err: unknown) {
      if (ValidationError.is(err)) {
        // Handle server validation errors
        (err.details as unknown as ValidationErrorDetail[]).forEach((fieldError) => {
          addError(fieldError.type);
        });
      } else {
        // Handle global error
        data.store?.onError?.(err, newText);
      }
    }
  };

  // Automatically replace contents when text changes
  // When the user has already made changes, we don't update the field. This
  // protects the user's changes but at the same time it allows overwriting
  // other people's changes.
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      reset();
      return;
    }

    if (changedByUser) {
      return;
    }
    reset();
  }, [data.text]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }
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
        text: data.placeholderText || t("editable.add_text", "Add text here"),
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
    meButton.h4.contentFA = '<i className="fa fa-header">';
    meButton.bold.aria = t("richtext.button.bold.title", "bold");
    meButton.italic.aria = t("richtext.button.italic.title", "italic");
    meButton.underline.aria = t("richtext.button.underline.title", "underline");
    meButton.unorderedlist.aria = t("richtext.button.unorderedlist.title", "unordered list");
    meButton.orderedlist.aria = t("richtext.button.orderedlist.title", "ordered list");

    meExtensions.anchor.prototype.aria = t("richtext.button.anchor.title", "link");

    if (!data.multiline) {
      meOptions.disableReturn = true;
      meOptions.toolbar = false;
    }

    // Initialize the editor interface
    // eslint-disable-next-line no-new
    new MediumEditor(element, meOptions);

    setNumberOfCharacters(element.innerText.trim().length);
  }, [align, data.placeholderText, data.multiline, t]);

  const handleEdit = () => {
    const element = elementRef.current;
    if (!element) {
      return;
    }
    element.focus();

    // Moving the cursor to the end of the editable element?
    // http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
    const selectEnd = function (el: Node) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    };
    selectEnd(element);
  };

  const handleSave = () => {
    resetErrors();
    // Check if input is invalid
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const clientValidations = data.store?.clientValidations;
    if (clientValidations) {
      Object.entries(clientValidations).forEach(([key, validation]) => {
        if (!validation.check(getEdited())) {
          addError(key);
        }
      });
    }
    if (!checkValidity()) {
      return;
    }

    store();
  };

  const handleCancel = () => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    reset();
    setChanged(false);

    // Get the number of visible characters
    setNumberOfCharacters(element.innerText.trim().length);
  };

  return (
    <>
      <div className={`editable-wrap ${wrapClasses()} ${errors.input ? "is-invalid" : ""}`}>
        <div
          ref={elementRef}
          className={`editable ${editableClasses()} ${characterLimitReached() ? "is-invalid" : ""}`}
          onInput={(event) => {
            // Register when the field is being edited

            // Fix placeholder position on empty after change
            if (event.currentTarget.innerText.length === 0) {
              // eslint-disable-next-line no-param-reassign
              event.currentTarget.innerHTML = "";
            }

            // Get the number of visible characters
            setNumberOfCharacters(event.currentTarget.innerText.trim().length);

            setChangedByUser(true);
            setChanged(true);

            data.onChange?.(
              getEdited(),
              numberOfCharacters,
              // send current total time in seconds
              totalFocusTimeInSeconds +
                Math.round((Date.now() - (startGettingFocus || Date.now())) / 1000),
            );
          }}
          onFocus={() => {
            setStartGettingFocus(Date.now());
          }}
          onBlur={() => {
            // persists current total time in seconds
            setTotalFocusTimeInSeconds(
              totalFocusTimeInSeconds +
                Math.round((Date.now() - (startGettingFocus || Date.now())) / 1000),
            );
          }}
        ></div>

        {characterLimitReached() ? (
          showControls() ? (
            <div className="invalid-feedback">
              {t("_inputField.maxlength", {
                NUMBER: removeNumberOfCharacters,
                MAXNUMBER: data.maxlength,
              })}
            </div>
          ) : (
            <div className="invalid-feedback">
              {t(
                "_inputField.maxlength.notEditing",
                "There are too many characters here. You should edit it.",
              )}
            </div>
          )
        ) : null}

        {!showControls() ? (
          <span className="fa-solid fa-pencil editable-icon" onClick={handleEdit}></span>
        ) : null}

        {errors.input}
      </div>
      {showControls() ? (
        <div className="editable-controls">
          {!characterLimitReached() ? <ButtonSave onClick={handleSave} /> : null}
          <ButtonCancel onClick={handleCancel} />
        </div>
      ) : null}
    </>
  );
}
