import Metatags from '/imports/Metatags.js';

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
