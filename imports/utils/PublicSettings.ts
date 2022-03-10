import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { LocalizedValue } from '/imports/utils/CustomChecks';

// See settings-example.json.md for full documentation

const defaults = {
	siteName: 'Hmmm',
	siteStage: '',
	testWarning: false,
	headerLogo: { src: '', alt: '' },
	headerLogoKiosk: { src: '', alt: '' },
	avatarLogo: { src: '', alt: '' },
	ogLogo: { src: 'openki_logo_2018.png' },
	regionSelection: { minNumber: 5, aboutLink: '' },
	i18nHelpLink: 'https://gitlab.com/Openki/Openki/-/wikis/i18n-howto',
	publicTenants: [] as string[],
	matomo: {
		jsPath: 'js/',
		phpPath: 'js/',
	},
	pricePolicyEnabled: true,
	feature: {
		login: { google: false, facebook: false, github: false },
	},
	// eslint-disable-next-line camelcase
	footerLinks: [] as { link: string; key?: string; title_key?: string; text?: string }[],
	faqLink: '/info/faq',
	pricePolicyLink: {
		en: '/info/faq#why-can-not-i-ask-for-a-fixed-price-as-a-mentor',
		de: '/info/faq#dürfen-kurse-etwas-kosten',
	},
	courseGuideLink: {
		en: 'https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf',
		de: 'https://about.openki.net/wp-content/uploads/2019/05/Wie-organisiere-ich-ein-Openki-Treffen.pdf',
	},
	aboutLink: 'https://about.openki.net',
	categories: {} as {
		[category: string]: string[];
	},
};

// none deep merge
const publicSettings = { ...defaults, ...Meteor.settings.public };

// Check that everything is set as expected in the settings.
check(
	publicSettings,
	Match.ObjectIncluding({
		siteName: String,
		siteStage: String,
		testWarning: Boolean,
		headerLogo: { src: String, alt: String },
		headerLogoKiosk: { src: String, alt: String },
		avatarLogo: { src: String, alt: String },
		ogLogo: { src: String },
		emailLogo: String,
		regionSelection: { minNumber: Number, aboutLink: Match.Maybe(LocalizedValue) },
		i18nHelpLink: Match.Maybe(LocalizedValue),
		publicTenants: [String],
		matomo: Match.Maybe(
			Match.OneOf(
				{
					jsPath: String,
					phpPath: String,
				},
				{
					url: String,
					site: Match.Integer,
					jsPath: String,
					phpPath: String,
				},
			),
		),
		pricePolicyEnabled: Boolean,
		feature: {
			login: { google: Boolean, facebook: Boolean, github: Boolean },
		},
		footerLinks: [
			{
				link: String,
				key: Match.Maybe(String),
				title_key: Match.Maybe(String),
				text: Match.Maybe(LocalizedValue),
			},
		],
		faqLink: LocalizedValue,
		pricePolicyLink: LocalizedValue,
		courseGuideLink: LocalizedValue,
		aboutLink: LocalizedValue,
		contribution: Match.Maybe({
			icon: String,
			forbiddenChars: [String],
			link: LocalizedValue,
		}),
		categories: Match.Where((c) => {
			check(c, Object);
			Object.values(c).forEach((value) => {
				check(value, [String]);
			});
			return true;
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
