import { Template } from 'meteor/templating';

import Metatags from '/imports/utils/metatags';

import './translate-info.html';

Template.translateInfo.helpers({
	setPageTitle() {
		Metatags.setCommonTags(mf('translate.windowtitle', 'Translate'));
	},
});
