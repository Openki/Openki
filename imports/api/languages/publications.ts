import fetch from 'node-fetch';
import { Match, check } from 'meteor/check';

import { LanguagesRaw, Languages, LanguageEntity } from '/imports/api/languages/languages';

import { Type } from '/imports/utils/CustomChecks';
import { ServerPublish } from '/imports/utils/ServerPublish';

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

export const FindFilterPattern = {
	code: Match.Maybe(String),
	visible: Match.Maybe(Boolean),
};
export type FindFilter = Type<typeof FindFilterPattern>;

// See: https://guide.meteor.com/data-loading.html#custom-publication
export const findFilter = ServerPublish(
	'Languages',
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function (_filter: FindFilter) {
		Object.entries(languages).forEach(([code, value]) => {
			this.added('Languages', code, value);
		});
	},
	(filter: FindFilter) => {
		check(filter, Match.Maybe(FindFilterPattern));

		const selector = {
			_id: filter.code,
		} as Mongo.Query<LanguageEntity>;

		if (typeof filter.visible === 'boolean') {
			selector.visible = filter.visible;
		}

		return Languages.find(selector);
	},
);
