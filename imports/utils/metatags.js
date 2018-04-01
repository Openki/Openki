export default Metatags = {};
import { DocHead } from 'meteor/kadira:dochead';
import { Meteor } from 'meteor/meteor';

function getSiteTitlePrefix() {
	return Meteor.settings.siteTitlePrefix || 'Openki - ';
}

function getSiteDefaultImage() {
	return Meteor.settings.siteDefaultImage || 'https://openki.net/logo/openki_logo_with_byline.png';
}

Metatags.removeAll = function() {
	DocHead.removeDocHeadAddedTags();
};

Metatags.setCommonTags = function(title, description = '') {
	document.title = getSiteTitlePrefix() + title;

	DocHead.addMeta({property: 'og:type', content: 'website'});
	DocHead.addMeta({property: 'og:title', content: document.title});
	DocHead.addMeta({property: 'og:image', content: getSiteDefaultImage()});

	DocHead.addMeta({name: 'twitter:card', content: 'summary'});
	DocHead.addMeta({name: 'twitter:title', content: document.title});
	DocHead.addMeta({name: 'twitter:image', content: getSiteDefaultImage()});

	if (description) {
		DocHead.addMeta({property: 'og:description', content: description});
		DocHead.addMeta({name: 'twitter:description', content: description});
	}
};
