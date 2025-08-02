import { i18n } from "/imports/startup/both/i18next";
import { ReactiveVar } from "meteor/reactive-var";

export interface ClientValidation {
  check: (text: string | undefined) => boolean;
  errorMessage: () => string;
}

export interface ServerValidationErrorHandler {
  type: string;
  message: () => string;
}

export interface Store {
  clientValidations?: Record<string, ClientValidation>;
  serverValidationErrors?: ServerValidationErrorHandler[];
  onSave?: (text: string) => Promise<void>;
  onSuccess?: (text: string | undefined) => void;
  onError?: (err: unknown, text: string | undefined) => void;
}

export interface State {
  text: () => string;
  changed: ReactiveVar<boolean>;
  multiline: boolean;
  placeholderText: string;
  showControls: boolean;
  store: Store;
}

/**
 * Editable objects keep state of RTE fields
 * This state includes
 *   text: Its text content before editing
 *   editing: Whether the field is being edited currently
 *   changed: Whether the field has been changed
 *   instance: The template instance that is currently displaying the editable
 *
 * This object interfaces with two template instances. The parent template that
 * includes the editable field, and also the template instance that represents
 * the editable field.
 *
 * For parent templates, the following methods are of interest:
 *   setText: set the text that should be displayed in the field. This can be
 *            called again when the source changes.
 *   getEdited: get the edited version of the text, returns undefined if the field
 *              was not changed
 *   getTotalFocusTimeInSeconds: gives the time in seconds how long the cursor
 *                               was in the field. For statistics and tracking.
 *  end: ends editing mode such as when changes have been saved
 *
 * Instances of editable templates connect() to this to get their interface.
 * It is assumed that only one instance is using this interface at a time,
 */
export class Editable {
  multiline: boolean;

  store: Store;

  placeholderText: string;

  showControls: boolean;

  /** Its text content before editing */
  text: ReactiveVar<string>;

  /** Whether the field has been changed */
  changed: ReactiveVar<boolean>;

  /** The template instance that is currently displaying the editable */
  editingInstance?:
    | {
        getEdited: () => string | undefined;
        getTotalFocusTimeInSeconds: () => number;
        numberOfCharacters: ReactiveVar<number>;
      }
    | undefined;

  maxlength?: number | undefined;

  constructor(multiline = false, placeholderText = "", maxlength?: number, store?: Store) {
    this.multiline = multiline;
    this.store = store || {};
    this.placeholderText = placeholderText;
    this.showControls = !!store;
    this.text = new ReactiveVar("");
    this.changed = new ReactiveVar(!store);
    this.editingInstance = undefined;
    this.maxlength = maxlength;
  }

  /**
   * set the text that should be displayed in the field.
   * This can be called again when the source changes.
   */
  setText(newText: string) {
    this.text.set(newText);
  }

  /**
   * get the edited version of the text, returns undefined if the field was not changed
   */
  getEdited(): string | undefined {
    return this.editingInstance?.getEdited();
  }

  /**
   * gives the time in seconds how long the cursor was in the field. For statistics and tracking.
   */
  getTotalFocusTimeInSeconds() {
    return this.editingInstance?.getTotalFocusTimeInSeconds() || 0;
  }

  getNumberOfCharacters() {
    return this.editingInstance?.numberOfCharacters.get();
  }

  /**
   * ends editing mode such as when changes have been saved
   */
  end() {
    this.changed.set(false);
  }

  connect(instance: {
    getEdited: () => string | undefined;
    getTotalFocusTimeInSeconds: () => number;
    numberOfCharacters: ReactiveVar<number>;
  }): State {
    this.editingInstance = instance;
    return {
      text: () => this.text.get(),
      changed: this.changed,
      multiline: this.multiline,
      placeholderText: this.placeholderText || i18n("editable.add_text", "Add text here"),
      showControls: this.showControls,
      store: this.store,
    };
  }
}
