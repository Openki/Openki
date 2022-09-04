import { Meteor } from 'meteor/meteor';

import { InfoPages } from '/imports/api/infoPages/infoPages';

Meteor.publish('infoPage', (slug, locale) => {
	const locales = [locale];
	const parts = locale.split('-');
	if (parts.length > 1) {
		locales.push(parts[0]);
	}
	locales.push('en');
	return InfoPages.find({ slug, locale: { $in: locales } }, { sort: { accuracy: -1 }, limit: 1 });
});
