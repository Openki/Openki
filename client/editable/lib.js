makeEditable = function(text, simple, store, beforeChange) {
	return {
		text: text,
		simple: simple,
		store: store,
		beforeChange: beforeChange
	};
}