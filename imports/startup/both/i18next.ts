import i18next, { TFunction } from 'i18next';
import ICU from 'i18next-icu';
import ChainedBackend from 'i18next-chained-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import { Languages } from '/imports/api/languages/languages';

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

i18next
	.use(ICU)
	.use(ChainedBackend)
	.init({
		fallbackLng: 'en',
		backend: {
			backends: [
				LocalStorageBackend,
				resourcesToBackend((language, _namespace, callback) => {
					import(`/imports/startup/both/i18n/${language}.json`)
						.then((resources) => {
							callback(null, resources);
						})
						.catch((error) => {
							callback(error, null);
						});
				}),
			],
			backendOptions: [
				{
					expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
				},
			],
		},
	});

if (Meteor.isServer) {
	// pre load all languages on the server.
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
 * A reactive wrapper for i18next.t
 */
export const i18n: TFunction = (...args: any) => {
	reactiveLang.get();
	return (i18next.t as any)(...args);
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
			return i18n(key, defaultValueOrData, data?.hash);
		}

		// function (key, data)
		return i18n(key, defaultValueOrData.hash);
	},
);

export default i18n;
