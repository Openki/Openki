makeEditable = function(text, store, beforeChange) {
	return {
		text: text,
		store: store,
		beforeChange: beforeChange
	};
}