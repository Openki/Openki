import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';

// Editable objects keep state of RTE fields
// This state includes
//   text: Its text content before editing
//   editing: Whether the field is being edited currently
//   changed: Whether the field has been changed
//   instance: The template instance that is currently displaying the editable
//
// This object interfaces with two template instances. The parent template that
// includes the editable field, and also the template instance that represents
// the editable field.
//
// For parent templates, the following methods are of interest:
//    setText: set the text that should be displayed in the field. This can be
//             called again when the source changes.
//    getEdited: get the edited version of the text, returns undefined if the field
//               was not changed
//    getTotalFocusTimeInSeconds: gives the time in seconds how long the cursor
//                                was in the field. For statistics and tracking.
//    end: ends editing mode such as when changes have been saved
//
// Instances of editable templates connect() to this to get their interface.
// It is assumed that only one instance is using this interface at a time,

export default class Editable {
	/**
	 * @param {boolean} [simple]
	 * @param {string} [placeholderText]
	 * @param {{check: (text:string) => boolean, errorMessage: () => string}[]} [validations]
	 * @param {(text: string)=>void} [store]
	 */
	constructor(simple = true, placeholderText = '', store = undefined, validations = []) {
		this.simple = simple;
		this.store = store;
		this.placeholderText = placeholderText;
		this.showControls = !!store;
		/** Its text content before editing */
		this.text = new ReactiveVar('');
		/** Whether the field has been changed */
		this.changed = new ReactiveVar(!store);
		/** @type {Blaze.Template|undefined} */
		this.editingInstance = undefined;
		this.validations = validations;
	}

	/**
	 * set the text that should be displayed in the field.
	 * This can be called again when the source changes.
	 * @param {string} newText
	 */
	setText(newText) {
		this.text.set(newText);
	}

	/**
	 * get the edited version of the text, returns undefined if the field was not changed
	 * @returns {string|undefined}
	 */
	getEdited() {
		return this.editingInstance?.getEdited();
	}

	/**
	 * gives the time in seconds how long the cursor was in the field. For statistics and tracking.
	 */
	getTotalFocusTimeInSeconds() {
		return this.editingInstance?.getTotalFocusTimeInSeconds() || 0;
	}

	/**
	 * ends editing mode such as when changes have been saved
	 */
	end() {
		this.changed.set(false);
	}

	/**
	 * @param {Blaze.Template} instance
	 */
	connect(instance) {
		this.editingInstance = instance;
		return {
			text: () => this.text.get(),
			changed: this.changed,
			simple: this.simple,
			placeholderText: this.placeholderText || mf('editable.add_text', 'Add text here'),
			showControls: this.showControls,
			validations: this.validations,
			store: this.store,
		};
	}
}
