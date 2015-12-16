makeEditable = function(text, simple, store, placeholderText) {
	return {
		text: text,
		simple: simple,
		store: store,
		placeholderText:  placeholderText || mf('editable.add_text', 'Add text here')
	};
};
