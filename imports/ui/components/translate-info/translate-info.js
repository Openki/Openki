import i18next from 'i18next';
import { Template } from 'meteor/templating';

import * as Metatags from '/imports/utils/metatags';

import './translate-info.html';

Template.translateInfo.helpers({
	setPageTitle() {
		Metatags.setCommonTags(i18next.t('translate.windowtitle', 'Translate'));
	},
});
