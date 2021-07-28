import { Meteor } from 'meteor/meteor';

export function getFaqLink() {
	return Meteor.settings.public.faqLink || '/info/faq';
}

export default getFaqLink;
