import Metatags from '/imports/Metatags.js';

Template.translateInfo.helpers({
	setPageTitle: function() {
		Metatags.setCommonTags(mf('translate.windowtitle', 'Translate'));
	}
});
