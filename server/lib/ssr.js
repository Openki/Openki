
/** Define {{mf}} helper on the server */
Blaze.Template.registerHelper('mf', (key, message, params) => {
	// Message parameter is optional
	if (!params) {
		// eslint-disable-next-line no-param-reassign
		params = message;
		// eslint-disable-next-line no-param-reassign
		message = null;
	}

	// eslint-disable-next-line no-param-reassign
	params = params.hash;

	return mf(key, params, message, params.LOCALE);
});
