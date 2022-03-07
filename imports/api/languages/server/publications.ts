import { Meteor } from 'meteor/meteor';
import fetch from 'node-fetch';

import { LanguagesRaw } from '/imports/api/languages/languages';

const weblateMapping = { de_ZH: 'de-ZH', nb_NO: 'nb' } as { [weblateCode: string]: string };

const languages = { ...LanguagesRaw };

/** Enrich Languages with stats from weblate */
(async function enrichLanguages() {
	try {
		// See: https://docs.weblate.org/en/latest/api.html#exports
		const response = await fetch(
			'https://hosted.weblate.org/exports/stats/openki/openki/?format=json',
		);
		const stats = (await response.json()) as {
			code: string;
			translated_percent: number;
		}[];

		Object.entries(languages).forEach(([code, value]) => {
			const translatedPercent = stats.filter((s) => (weblateMapping[s.code] || s.code) === code)[0]
				?.translated_percent;

			if (translatedPercent) {
				// eslint-disable-next-line no-param-reassign
				value.translatedPercent = Math.round(translatedPercent);
			}
		});
	} catch {
		// ignore it
	}
})();

// See: https://guide.meteor.com/data-loading.html#custom-publication
Meteor.publish('Languages', async function () {
	Object.entries(languages).forEach(([code, value]) => {
		this.added('Languages', code, value);
	});

	// We can call ready to indicate to the client that the initial document sent has been sent
	this.ready();
});
