import { Template } from 'meteor/templating';

import Metatags from '/imports/Metatags.js';

import './translate-info.html';

Template.translateInfo.helpers({
	setPageTitle: function() {
		Metatags.setCommonTags(mf('translate.windowtitle', 'Translate'));
	}
});
