import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';

import * as Metatags from '/imports/utils/metatags';

import './translate-info.html';

Template.translateInfo.helpers({
	setPageTitle() {
		Metatags.setCommonTags(mf('translate.windowtitle', 'Translate'));
	},
});
