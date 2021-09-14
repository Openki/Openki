module.exports = {
	// Save the \_old files
	createOldCatalogs: false,

	// Key separator used in your translation keys
	// If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.
	keySeparator: false,

	lexers: {
		html: [
			{
				lexer: 'HandlebarsLexer',
				functions: ['i18n'], // Array of functions to match
			},
		],

		js: ['JavascriptLexer'], // if you're writing jsx inside .js files, change this to JsxLexer
		ts: ['JavascriptLexer'],

		default: ['JavascriptLexer'],
	},

	// An array of the locales in your applications
	locales: ['en'],

	// Namespace separator used in your translation keys
	// If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.
	namespaceSeparator: false,

	// Supports $LOCALE and $NAMESPACE injection
	// Supports JSON (.json) and YAML (.yml) file formats
	// Where to write the locale files relative to process.cwd()
	output: 'imports/startup/both/i18n/$LOCALE.json',

	// An array of globs that describe where to look for source files
	// relative to the location of the configuration file
	input: ['imports/**/*.{js,ts,html}', 'private/emails/**/*.html'],

	// Whether or not to sort the catalog
	sort: true,
};
