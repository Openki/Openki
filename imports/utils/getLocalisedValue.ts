/**
 * Returns a loacalised value based on the current set locale. 
 * @example {
			"en": "https://about.openki.net/en/ueber-uns/spenden/",
			"de": "https://about.openki.net/ueber-uns/spenden/"
		}
 */
export function getLocalisedValue(
	setting: string | Record<string, unknown> | undefined | null,
	locale: string = Session.get('locale'),
) {
	if (!setting) {
		return undefined;
	}

	if (typeof setting === 'string') {
		return setting;
	}

	if (setting[locale]) {
		// excact match found
		return setting[locale];
	}

	const parts = locale.split('-');
	if (parts.length > 1) {
		if (setting[parts[0]]) {
			// found eg. "de" for "de-CH"
			return setting[locale];
		}
	}

	// fallback take first
	return setting[Object.keys(setting)[0]];
}

export default getLocalisedValue;
