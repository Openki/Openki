import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ValidationError, ValidationErrorDetail } from "meteor/mdg:validation-error";
import MediumEditor from "medium-editor";
import { Mapping, useValidation } from "../../lib/useValidation";
import { useSessionEquals } from "../../../utils/react-meteor-data";
import { ButtonSave, ButtonCancel } from "../Buttons";
import { Store } from "../../lib/editable";

import "./styles.scss";

export interface Props {
  text?: string | undefined;
  multiline?: boolean;
  placeholder?: string | undefined;
  maxlength?: number | undefined;
  onStartEditing?: (() => void) | undefined;
  onChange?: (
    newText: string | undefined,
    numberOfCharacters: number,
    totalFocusTimeInSeconds: number,
  ) => void;
  store?: Store | undefined;
}

export function Editable({
  text = "",
  multiline,
  placeholder,
  maxlength,
  onStartEditing,
  onChange,
  store,
}: Props) {
  const { t } = useTranslation();
  const [numberOfCharacters, setNumberOfCharacters] = useState(0);
  const [changed, setChanged] = useState(!store);

  const [totalFocusTimeInSeconds, setTotalFocusTimeInSeconds] = useState(0);
  const [startGettingFocus, setStartGettingFocus] = useState<number | undefined>(undefined);
  const isRTL = useSessionEquals("textDirectionality", "rtl");

  const elementRef = useRef<HTMLDivElement>(null);

  // Add error mapping for the FormfieldErrors
  const errorMapping: Mapping<"input"> = {};
  const clientValidations = store?.clientValidations;
  if (clientValidations) {
    Object.entries(clientValidations).forEach(([key, validation]) => {
      errorMapping[key] = {
        field: "input",
        text: validation.errorMessage,
      };
    });
  }
  store?.serverValidationErrors?.forEach((e) => {
    errorMapping[e.type] = {
      field: "input",
      text: e.message,
    };
  });

  const [errors, checkValidity, addError, resetErrors] = useValidation(errorMapping);

  const getEdited = () => {
    if (!changed) {
      return undefined;
    }
    const element = elementRef.current;
    if (!element) {
      return undefined;
    }
    return multiline ? element.innerHTML.trim() : element.innerText.trim();
  };

  function characterLimitReached() {
    if (!maxlength) {
      return false;
    }

    return numberOfCharacters > maxlength;
  }
  function removeNumberOfCharacters() {
    if (!maxlength) {
      return 0;
    }

    return numberOfCharacters - maxlength;
  }
  function showControls() {
    return !!store && changed;
  }
  function wrapClasses() {
    return multiline ? "editable-wrap-multiline" : "editable-wrap-singleline";
  }
  function editableClasses() {
    const classes: string[] = [];

    if (changed) {
      classes.push("editable-changed");
    }

    if (!store) {
      classes.push("form-control");
    }

    return classes.join(" ");
  }

  function reset() {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    if (multiline) {
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
  }

  useEffect(() => {
    if (getEdited() !== text) {
      reset();
    }
  }, [text]);

  const save = async () => {
    const newText = getEdited();
    if (newText === undefined) {
      // Nothing has changed
      return;
    }
    try {
      await store?.onSave?.(newText);

      setChanged(false);

      setStartGettingFocus(undefined);
      setTotalFocusTimeInSeconds(0);

      store?.onSuccess?.(newText);
    } catch (err: unknown) {
      if (ValidationError.is(err)) {
        // Handle server validation errors
        (err.details as unknown as ValidationErrorDetail[]).forEach((fieldError) => {
          addError(fieldError.type);
        });
      } else {
        // Handle global error
        store?.onError?.(err, newText);
      }
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
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
        text: placeholder || t("editable.add_text", "Add text here"),
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

    if (!multiline) {
      meOptions.disableReturn = true;
      meOptions.toolbar = false;
    }

    // Initialize the editor interface
    new MediumEditor(element, meOptions);

    setNumberOfCharacters(element.innerText.trim().length);
  }, [placeholder, multiline, t, isRTL]);

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

  const handleSave = async () => {
    resetErrors();
    // Check if input is invalid

    const clientValidations = store?.clientValidations;
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

    save();
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
      <div
        className={`editable-wrap ${wrapClasses()}`}
        onClick={() => {
          onStartEditing?.();
        }}
      >
        <div
          ref={elementRef}
          className={`editable ${editableClasses()} ${
            characterLimitReached() || errors.input ? "is-invalid" : ""
          }`}
          onKeyUp={(event) => {
            // Register when the field is being edited

            // Fix placeholder position on empty after change
            if (event.currentTarget.innerText.length === 0) {
              event.currentTarget.innerHTML = "";
            }

            // Get the number of visible characters
            setNumberOfCharacters(event.currentTarget.innerText.trim().length);

            setChanged(true);

            onChange?.(
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
          <div className="invalid-feedback">
            {showControls()
              ? t("_inputField.maxlength", {
                  NUMBER: removeNumberOfCharacters,
                  MAXNUMBER: maxlength,
                })
              : t(
                  "_inputField.maxlength.notEditing",
                  "There are too many characters here. You should edit it.",
                )}
          </div>
        ) : (
          !!errors.input && <div className="invalid-feedback">{errors.input}</div>
        )}

        {!showControls() && (
          <span className="fa-solid fa-pencil editable-icon" onClick={handleEdit}></span>
        )}
      </div>
      {showControls() && (
        <div className="editable-controls">
          {!characterLimitReached() && <ButtonSave onClick={handleSave} />}
          <ButtonCancel onClick={handleCancel} />
        </div>
      )}
    </>
  );
}
