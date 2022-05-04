import { body as faqEn } from './faq/faq.en';
import { body as faqDe } from './faq/faq.de';
import { body as faqFr } from './faq/faq.fr';

export const infoPages = [
	{
		slug: 'faq',
		locale: 'en',
		accuracy: 1,
		title: 'FAQ',
		body: faqEn,
	},
	{
		slug: 'faq',
		locale: 'de',
		accuracy: 2,
		title: 'Häufige Fragen',
		body: faqDe,
	},
	{
		slug: 'faq',
		locale: 'fr',
		accuracy: 2,
		title: 'FAQ',
		body: faqFr,
	},
];

export default infoPages;
