import i18next, { TFunction } from 'i18next';
import ICU from 'i18next-icu';
import ChainedBackend from 'i18next-chained-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import { Languages } from '/imports/api/languages/languages';
import { Blaze, Handlebars } from 'meteor/blaze';
import { Spacebars } from 'meteor/spacebars';

// eslint-disable-next-line no-constant-condition
if (false) {
	// whitelist, this is needed for meteor's dynamic-import module, to allow dynamic loading of modules
	// on the client: https://docs.meteor.com/packages/dynamic-import.html#Using-import-with-dynamic-expressions
	import(`/imports/startup/both/i18n/en.json`);

	import(`/imports/startup/both/i18n/af.json`);
	import(`/imports/startup/both/i18n/am.json`);
	import(`/imports/startup/both/i18n/ar.json`);
	import(`/imports/startup/both/i18n/da.json`);
	import(`/imports/startup/both/i18n/de-ZH.json`);
	import(`/imports/startup/both/i18n/de.json`);
	import(`/imports/startup/both/i18n/el.json`);
	import(`/imports/startup/both/i18n/es.json`);
	import(`/imports/startup/both/i18n/fa.json`);
	import(`/imports/startup/both/i18n/fr.json`);
	import(`/imports/startup/both/i18n/hu.json`);
	import(`/imports/startup/both/i18n/it.json`);
	import(`/imports/startup/both/i18n/ja.json`);
	import(`/imports/startup/both/i18n/nl.json`);
	import(`/imports/startup/both/i18n/pt.json`);
	import(`/imports/startup/both/i18n/rm.json`);
	import(`/imports/startup/both/i18n/ru.json`);
	import(`/imports/startup/both/i18n/sv.json`);
	import(`/imports/startup/both/i18n/tr.json`);
	import(`/imports/startup/both/i18n/zh-CN.json`);
	import(`/imports/startup/both/i18n/zh-TW.json`);
}

let localStorageSupported;
try {
	localStorage.setItem('test1234', 'test1234');
	localStorage.removeItem('test1234');
	localStorageSupported = true;
} catch {
	// not allowed
	localStorageSupported = false;
}

const backends = [];

if (localStorageSupported) {
	// we use localstorage to cache translations for 7 days
	backends.push(LocalStorageBackend);
}

// and only load translations we need
backends.push(
	resourcesToBackend((language, _namespace, callback) => {
		import(`/imports/startup/both/i18n/${language}.json`)
			.then((resources) => {
				callback(null, resources);
			})
			.catch((error) => {
				callback(error, null);
			});
	}),
);

i18next
	.use(ICU)
	.use(ChainedBackend)
	.init({
		fallbackLng: 'en',
		backend: {
			backends,
			backendOptions: [
				{
					expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
				},
			],
		},
	});

if (Meteor.isServer) {
	// on the server we pre load all languages.
	i18next.loadLanguages(Object.keys(Languages));
}

/**
 * A reactive store that changed after a lang has changed and is ready (eg. after resource loading).
 * It is used to update string in the ui after without reloading the page
 */
const reactiveLang = new ReactiveVar(Math.random());
i18next.on('languageChanged', function () {
	reactiveLang.set(Math.random());
});
i18next.on('loaded', function () {
	reactiveLang.set(Math.random());
});

/**
 * A reactive wrapper for i18next.t. Use { escapeText: true } to escape the i18n text. You can use
 * Spacebars.SafeString(..) for params to allow some HTML.
 */
export const i18n: TFunction = (...args: any[]) => {
	reactiveLang.get();
	const result = (i18next.t as any)(...args);

	let escapeText: boolean;
	if (args.length === 2) {
		escapeText = args[1].escapeText || false;
	} else if (args.length === 3) {
		escapeText = args[2].escapeText || false;
	} else {
		escapeText = false;
	}

	if (Array.isArray(result)) {
		// in some cases we get a string[] array back but we expect a string
		return result
			.map((s) => {
				if (s instanceof Handlebars.SafeString) {
					return s;
				}

				return escapeText !== false ? Blaze._escape(s) : s;
			})
			.join('');
	}

	return escapeText !== false ? Blaze._escape(result) : result;
};

// register a helper to use it in the templates
Template.registerHelper(
	'i18n',
	function (
		key: string,
		defaultValueOrData: string | { hash?: Record<string, unknown> } = {},
		data?: { hash: Record<string, unknown> },
	) {
		// defaultValue is optional
		if (typeof defaultValueOrData === 'string') {
			// function (key, defaultValue, data)
			// We can use SafeString because i18n encodes all non-safe strings
			return Spacebars.SafeString(
				i18n(key, defaultValueOrData, { ...data?.hash, escapeText: true }),
			);
		}

		// function (key, data)
		// We can use SafeString because i18n encodes all non-safe strings
		return Spacebars.SafeString(i18n(key, { ...defaultValueOrData.hash, escapeText: true }));
	},
);

export default i18n;
