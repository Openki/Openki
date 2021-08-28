import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { LocalisedValue, StringArray } from './CustomChecks';

// See settings-example.json.md for full documentation

const defaults = {
	siteName: 'Hmmm',
	siteStage: '',
	headerLogo: { src: '', alt: '' },
	headerLogoKiosk: { src: '', alt: '' },
	avatarLogo: { src: '', alt: '' },
	ogLogo: { src: 'openki_logo_2018.png' },
	publicTenants: [],
	pricePolicyEnabled: true,
	faqLink: '/info/faq',
	courseGuideLink: {
		en: 'https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf',
		de: 'https://about.openki.net/wp-content/uploads/2019/05/Wie-organisiere-ich-ein-Openki-Treffen.pdf',
	},
	aboutLink: 'https://about.openki.net',
};

// none deep merge
const publicSettings = { ...defaults, ...Meteor.settings.public };

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
		publicTenants: StringArray,
		pricePolicyEnabled: Boolean,
		faqLink: LocalisedValue,
		courseGuideLink: LocalisedValue,
		aboutLink: LocalisedValue,
		contribution: Match.Maybe({
			icon: String,
			forbiddenChars: StringArray,
			link: LocalisedValue,
		}),
	}),
);

/**
 * Get access to some settings from the `Meteor.settings.public` enriched with default values.
 */
export const PublicSettings = publicSettings;

export default PublicSettings;
