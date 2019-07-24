import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import UrlTools from '/imports/utils/url-tools';

import './kiosk-link.html';

Template.kioskLink.helpers({
	link() {
		const filterParams = Session.get('kioskFilter');
		if (!filterParams) return;

		delete filterParams.region; // HACK region is kept in the session (for bad reasons)
		const queryString = UrlTools.paramsToQueryString(filterParams);

		const options = {};
		if (queryString.length) {
			options.query = queryString;
		}

		return Router.url('kioskEvents', {}, options);
	},
});

Template.kioskLink.events({
	'click .js-remove-back-to-kiosk': function () {
		return Session.set('kioskFilter', false);
	},
});
