import { Meteor } from 'meteor/meteor';

export function getAboutLink(): string {
	return Meteor.settings.public.aboutLink || 'https://about.openki.net';
}

export default getAboutLink;
