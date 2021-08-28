import { DocHead } from 'meteor/kadira:dochead';
import { Meteor } from 'meteor/meteor';
import { PublicSettings } from './PublicSettings';

function getSiteTitlePrefix() {
	return `${PublicSettings.siteName}  - `;
}

function getSiteDefaultImage() {
	return Meteor.absoluteUrl(`logo/${PublicSettings.ogLogo.src}`);
}

export function removeAll() {
	DocHead.removeDocHeadAddedTags();
}

export function setCommonTags(title: string, description = '') {
	document.title = getSiteTitlePrefix() + title;

	DocHead.addMeta({ property: 'og:type', content: 'website' });
	DocHead.addMeta({ property: 'og:title', content: document.title });
	DocHead.addMeta({ property: 'og:image', content: getSiteDefaultImage() });

	DocHead.addMeta({ name: 'twitter:card', content: 'summary' });
	DocHead.addMeta({ name: 'twitter:title', content: document.title });
	DocHead.addMeta({ name: 'twitter:image', content: getSiteDefaultImage() });

	if (description) {
		DocHead.addMeta({ property: 'og:description', content: description });
		DocHead.addMeta({ name: 'twitter:description', content: description });
	}
}
