import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

// See settings-example.json.md for full documentation

const defaults = {
	siteName: 'Hmmm',
	siteStage: '',
	headerLogo: { src: '', alt: '' },
	headerLogoKiosk: { src: '', alt: '' },
	avatarLogo: { src: '', alt: '' },
	ogLogo: { src: 'openki_logo_2018.png' },
	publicTenants: [],
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
		siteStage: String,
		headerLogo: { src: String, alt: String },
		headerLogoKiosk: { src: String, alt: String },
		avatarLogo: { src: String, alt: String },
		ogLogo: { src: String },
		emailLogo: String,
		publicTenants: [String],
		faqLink: LocalisedValue,
		courseGuideLink: LocalisedValue,
		aboutLink: LocalisedValue,
		contribution: Match.Maybe({
			icon: String,
			forbiddenChars: [String] as unknown as Match.Matcher<string[]>,
			link: LocalisedValue,
		}),
	}),
);

/**
 * Get access to some settings from the `Meteor.settings.public` enriched with default values.
 */
export const PublicSettings = publicSettings;

export default PublicSettings;
