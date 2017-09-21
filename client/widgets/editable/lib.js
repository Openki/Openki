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

Editable = function(simple, store, placeholderText, showControls) {
	if (typeof showControls == 'undefined') showControls = true;

	var text = ReactiveVar('');
	var changed = ReactiveVar(!showControls);
	var editingInstance = false;

	return {
		setText: function(newText) { text.set(newText); },
		getEdited: function() {
			if (editingInstance) {
				return editingInstance.getEdited();
			}
			return false;
		},
		end: function() { changed.set(false); },
		connect: function(instance) {
			editingInstance = instance;
			return {
				text: function() { return text.get(); },
				changed: changed,
				simple: simple,
				placeholderText:  placeholderText || mf('editable.add_text', 'Add text here'),
				showControls: showControls,
				store: store
			};
		}
	};
};
