import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

const defaults = {
	siteName: 'Hmmm',
	faqLink: '/info/faq',
	courseGuideLink: {
		en: 'https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf',
		de: 'https://about.openki.net/wp-content/uploads/2019/05/Wie-organisiere-ich-ein-Openki-Treffen.pdf',
	},
	aboutLink: 'https://about.openki.net',
};

// none deep merge
export const publicSettings = { ...defaults, ...Meteor.settings.public };

/** allows localised value eg. with `getLocalisedValue(...)` to have a string per language. */
const LocalisedValue = Match.OneOf(
	String,
	Match.ObjectIncluding<Record<string, string | undefined>>({}),
);

// Check that everything is set as expected in the settings.
check(
	publicSettings,
	Match.ObjectIncluding({
		siteName: String,
		faqLink: LocalisedValue,
		courseGuideLink: LocalisedValue,
		aboutLink: LocalisedValue,
	}),
);

/**
 * Get access to some settings from the `Meteor.settings.public` enriched with default values.
 */
export const PublicSettings = publicSettings;

export default PublicSettings;
