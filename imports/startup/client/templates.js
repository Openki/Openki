import Metatags from '/imports/utils/metatags';

import '/imports/ui/layouts';
import '/imports/ui/pages';

Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loadingPage',
});
Router.onBeforeAction('dataNotFound');

// eslint-disable-next-line func-names
Router.onBeforeAction(function () {
	Metatags.removeAll();
	this.next();
});
