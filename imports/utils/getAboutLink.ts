import { Meteor } from 'meteor/meteor';

export function getAboutLink() {
	return Meteor.settings.public.aboutLink || 'https://about.openki.net';
}

export default getAboutLink;
