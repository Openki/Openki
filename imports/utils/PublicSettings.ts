import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { LocalisedValue } from './CustomChecks';

// See settings-example.json.md for full documentation

const defaults = {
	siteName: 'Hmmm',
	siteStage: '',
	headerLogo: { src: '', alt: '' },
	headerLogoKiosk: { src: '', alt: '' },
	avatarLogo: { src: '', alt: '' },
	ogLogo: { src: 'openki_logo_2018.png' },
	regionSelection: { minNumber: 5, aboutLink: '' },
	i18nHelpLink: 'https://gitlab.com/Openki/Openki/-/wikis/i18n-howto',
	publicTenants: [] as string[],
	pricePolicyEnabled: true,
	// eslint-disable-next-line camelcase
	footerLinks: [] as { link: string; key?: string; title_key?: string; text?: string }[],
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
		regionSelection: { minNumber: Number, aboutLink: Match.Maybe(LocalisedValue) },
		i18nHelpLink: Match.Maybe(LocalisedValue),
		publicTenants: [String],
		pricePolicyEnabled: Boolean,
		footerLinks: [
			{
				link: String,
				key: Match.Maybe(String),
				title_key: Match.Maybe(String),
				text: Match.Maybe(LocalisedValue),
			},
		],
		faqLink: LocalisedValue,
		courseGuideLink: LocalisedValue,
		aboutLink: LocalisedValue,
		contribution: Match.Maybe({
			icon: String,
			forbiddenChars: [String],
			link: LocalisedValue,
		}),
		s3: {
			publicUrlBase: String,
		},
	}),
);

/**
 * Get access to some settings from the `Meteor.settings.public` enriched with default values.
 */
export const PublicSettings = publicSettings;

export default PublicSettings;
