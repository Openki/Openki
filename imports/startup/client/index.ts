import './client-error';
import './extend-instance';
import './locale';
import './templates';
import './dark-mode';
import './template-helpers';
import './translations.html';
import './useraccounts-configuration';

import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';

import * as RegionSelection from '/imports/utils/region-selection';
import { hideTooltips } from '/imports/utils/enableTooltips';

import { Introduction } from '/imports/ui/lib/introduction';

import './bootstrap';

// close any verification dialogs still open
Router.onBeforeAction(function () {
	hideTooltips(document);

	Session.set('verify', false);

	this.next();
});

Meteor.startup(RegionSelection.init);
Meteor.startup(Introduction.init);
