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
//    getEdited: get the edited version of the text, returns false if the field
//               was not changed
//    end: ends editing mode such as when changes have been saved
//
// Instances of editable templates connect() to this to get their interface.
// It is assumed that only one instance is using this interface at a time,

export default class Editable {
	constructor(simple, store, placeholderText, showControls = true) {
		this.simple = simple;
		this.store = store;
		this.placeholderText = placeholderText;
		this.showControls = showControls;
		this.text = new ReactiveVar('');
		this.changed = new ReactiveVar(!showControls);
		this.editingInstance = false;
	}
	setText(newText) {
		this.text.set(newText);
	}
	getEdited() {
		if (this.editingInstance) {
			return this.editingInstance.getEdited();
		}
		return false;
	}
	end() {
		this.changed.set(false);
	}
	connect(instance) {
		this.editingInstance = instance;
		return {
			text: () => this.text.get(),
			changed: this.changed,
			simple: this.simple,
			placeholderText: this.placeholderText || mf('editable.add_text', 'Add text here'),
			showControls: this.showControls,
			store: this.store
		};
	}
}
