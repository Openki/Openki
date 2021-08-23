import { Router } from 'meteor/iron:router';

import * as Metatags from '/imports/utils/metatags';

import '/imports/ui/layouts';
import '/imports/ui/pages';

Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loadingPage',
});
Router.onBeforeAction('dataNotFound');

Router.onBeforeAction(function (this: any) {
	Metatags.removeAll();
	this.next();
});
