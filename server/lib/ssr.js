
/** Define {{mf}} helper on the server */
Blaze.Template.registerHelper("mf", function(key, message, params) {
	var _HTML = params && (params._HTML || params._html);

	message = params ? message : null;
	params = params ? params.hash : {};

	var result = mf(key, params, message, params.LOCALE);
	if (_HTML) {
		return Spacebars.SafeString(msgfmt.sanitizeHTML(result, _HTML));
	}
	return result;
});