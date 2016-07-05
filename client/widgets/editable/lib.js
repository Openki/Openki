makeEditable = function(text, simple, store, placeholderText, showControls) {
	if (typeof showControls == 'undefined') showControls = true;

	return {
		text: text,
		simple: simple,
		store: store,
		placeholderText:  placeholderText || mf('editable.add_text', 'Add text here'),
		showControls: showControls,
		editedContent: false,
		end: false
	};
};
