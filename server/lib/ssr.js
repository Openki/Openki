
/** Define {{mf}} helper on the server */
Blaze.Template.registerHelper('mf', (key, message, params) => {
	// Message parameter is optional
	if (!params) {
		params = message;
		message = null;
	}

	params = params.hash;

	return mf(key, params, message, params.LOCALE);
});
