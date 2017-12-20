import Metatags from '/imports/utils/metatags.js';

import '/imports/ui/layouts';
import '/imports/ui/pages';

Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loadingPage',
});
Router.onBeforeAction('dataNotFound');

Router.onBeforeAction(function() {
	Metatags.removeAll();
	this.next();
});
