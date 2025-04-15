import { i18n } from "/imports/startup/both/i18next";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { ValidationError, ValidationErrorDetail } from "meteor/mdg:validation-error";
import { Session } from "meteor/session";
import { ReactiveVar } from "meteor/reactive-var";

import * as TemplateMixins from "/imports/ui/lib/template-mixins";
import { Editable, State } from "/imports/ui/lib/editable";

import MediumEditor from "medium-editor";

import "/imports/ui/components/buttons";

import "./template.html";
import "./styles.scss";

function EditableMixing<
  N extends string,
  D extends Editable,
  T extends Record<string, unknown> & {
    numberOfCharacters: ReactiveVar<number>;
  },
>(TemplateBase: TemplateStaticTyped<N, D, T>, templateName: N) {
  const Template = TemplateMixins.FormfieldErrors(
    TemplateBase as TemplateStaticTyped<
      N,
      D,
      T & {
        state: State;
        errorMapping: TemplateMixins.FormfieldErrorsMapping;
        editor: MediumEditor.MediumEditor;
        getEdited: () => string | undefined;
        getTotalFocusTimeInSeconds: () => number;
        numberOfCharacters: ReactiveVar<number>;
        store: () => Promise<void>;
        reset: () => void;
      }
    >,
    templateName,
  );

  const template = Template[templateName];
  template.onCreated(function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const instance = this;
    // This reeks
    const { data } = instance;
    if (!data) {
      throw new Error("Editable got empty data");
    }
    instance.state = data.connect(instance);

    instance.numberOfCharacters = new ReactiveVar(0);

    // Add error mapping for the FormfieldErrors
    const errorMapping: TemplateMixins.FormfieldErrorsMapping = {};
    const { clientValidations } = instance.state.store;
    if (clientValidations) {
      Object.entries(clientValidations).forEach(([key, validation]) => {
        errorMapping[key] = {
          text: validation.errorMessage,
          field: "input",
        };
      });
    }
    instance.state.store?.serverValidationErrors?.forEach((e) => {
      errorMapping[e.type] = {
        text: e.message,
        field: "input",
      };
    });

    instance.errorMapping = errorMapping;
  });

  template.onRendered(function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const instance = this;
    const $editable = instance.$(".js-editable");
    let initialized = false;
    let changedByUser = false;
    let totalFocusTimeInSeconds = 0;
    let startGettingFocus: number | undefined;

    instance.getEdited = () => {
      if (!instance.state?.changed.get()) {
        return undefined;
      }
      return instance.state.multiline ? $editable.html().trim() : $editable.text().trim();
    };

    instance.getTotalFocusTimeInSeconds = () => {
      return totalFocusTimeInSeconds;
    };

    instance.reset = () => {
      const text = instance.state.text();

      if (instance.state.multiline) {
        $editable.html(text);
      } else {
        $editable.text(text);
      }

      // HACK remove placeholder when there is content
      // We should be using setContent() anyway, but it's not defined?!
      if (text) {
        $editable.removeClass("medium-editor-placeholder medium-editor-placeholder-relative");
      }

      instance.errors.reset();
    };

    // Automatically replace contents when text changes
    // When the user has already made changes, we don't update the field. This
    // protects the user's changes but at the same time it allows overwriting
    // other people's changes.
    instance.autorun(() => {
      if (!changedByUser || !initialized) {
        instance.reset();
        initialized = true;
      }
    });

    instance.store = async () => {
      const newText = instance.getEdited();
      if (newText === undefined) {
        // Nothing has changed
        return;
      }
      try {
        await instance.state.store.onSave?.(newText);

        instance.state.changed.set(false);
        changedByUser = false;
        startGettingFocus = undefined;
        totalFocusTimeInSeconds = 0;

        instance.state.store.onSuccess?.(newText);
      } catch (err: unknown) {
        if (ValidationError.is(err)) {
          // Handle server validation errors
          (err.details as unknown as ValidationErrorDetail[]).forEach((fieldError) => {
            instance.errors.add(fieldError.type);
          });
        } else {
          // Handle global error
          instance.state.store.onError?.(err, newText);
        }
      }
    };

    const isRTL = Session.equals("textDirectionality", "rtl");
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
        text:
          instance.state.placeholderText || i18n("richtext.placeholder.default", "Type your text"),
      },
      anchor: {
        linkValidation: true,
        placeholderText: i18n("richtext.link.placeholder", "Paste or type a link"),
      },
      autoLink: true,
      buttonLabels: "fontawesome",
    };

    // Make titles translateable
    const meExtensions = (MediumEditor as any).extensions;

    const meButton = meExtensions.button.prototype.defaults;
    meButton.h4.aria = i18n("richtext.button.h4.title", "subheader");
    meButton.h4.contentFA = '<i class="fa fa-header">';
    meButton.bold.aria = i18n("richtext.button.bold.title", "bold");
    meButton.italic.aria = i18n("richtext.button.italic.title", "italic");
    meButton.underline.aria = i18n("richtext.button.underline.title", "underline");
    meButton.unorderedlist.aria = i18n("richtext.button.unorderedlist.title", "unordered list");
    meButton.orderedlist.aria = i18n("richtext.button.orderedlist.title", "ordered list");

    meExtensions.anchor.prototype.aria = i18n("richtext.button.anchor.title", "link");

    if (!instance.state.multiline) {
      meOptions.disableReturn = true;
      meOptions.toolbar = false;
    }

    // Initialize the editor interface
    // eslint-disable-next-line no-new
    new MediumEditor($editable[0], meOptions);

    instance.numberOfCharacters.set($editable.text().trim().length);

    // Register when the field is being edited
    $editable.on("input", () => {
      // Fix placeholder position on empty after change
      if ($editable.text().length === 0) {
        $editable.html("");
      }

      // Get the number of visible characters
      instance.numberOfCharacters.set($editable.text().trim().length);

      changedByUser = true;
      instance.state.changed.set(true);
    });

    $editable.on("focus", () => {
      startGettingFocus = Date.now();
    });
    $editable.on("blur", () => {
      totalFocusTimeInSeconds += Math.round(
        (Date.now() - (startGettingFocus || Date.now())) / 1000,
      );
    });
  });

  template.helpers({
    characterLimitReached() {
      const instance = Template.instance();

      if (!instance.data.maxlength) {
        return false;
      }

      return instance.numberOfCharacters.get() > instance.data.maxlength;
    },

    removeNumberOfCharacters() {
      const instance = Template.instance();

      if (!instance.data.maxlength) {
        return 0;
      }

      return instance.numberOfCharacters.get() - instance.data.maxlength;
    },

    showControls() {
      const instance = Template.instance();
      return instance.state.showControls && instance.state.changed.get();
    },

    wrapClasses() {
      const instance = Template.instance();
      return instance.state.multiline ? "editable-wrap-multiline" : "editable-wrap-singleline";
    },

    editableClasses() {
      const instance = Template.instance();

      const classes = [];

      if (instance.state.changed.get()) {
        classes.push("editable-changed");
      }

      if (!instance.state.showControls) {
        classes.push("form-control");
      }

      return classes.join(" ");
    },
  });

  template.events({
    "click .js-editable-save"(event, instance) {
      event.preventDefault();

      // Check if input is invalid
      instance.errors.reset();
      const { clientValidations } = instance.state.store;
      if (clientValidations) {
        Object.entries(clientValidations).forEach(([key, validation]) => {
          if (!validation.check(instance.getEdited())) {
            instance.errors.add(key);
          }
        });
      }
      if (instance.errors.present()) {
        return;
      }

      instance.store();
    },

    "click .js-editable-cancel"(event, instance) {
      event.preventDefault();
      instance.reset();
      instance.state.changed.set(false);

      // Get the number of visible characters
      const $editable = instance.$(".js-editable");
      instance.numberOfCharacters.set($editable.text().trim().length);
    },

    "click .js-editable-edit"(_event, instance) {
      instance.$(".js-editable").trigger("focus");

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
      selectEnd(instance.$(".js-editable")[0]);
    },
  });
}

["editable"].forEach((templateName) => {
  EditableMixing(TemplateAny as any, templateName);
});
