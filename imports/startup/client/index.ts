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
import * as Tooltips from '/imports/utils/Tooltips';

import { Introduction } from '/imports/ui/lib/introduction';

import './bootstrap';

// close any verification dialogs still open
Router.onBeforeAction(function () {
	Tooltips.hide();

	Session.set('verify', false);

	this.next();
});

Meteor.startup(RegionSelection.init);
Meteor.startup(Introduction.init);
