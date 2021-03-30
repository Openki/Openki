import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { Alert } from '/imports/api/alerts/alert';

import '/imports/ui/components/regions/selection/region-selection';

import './region-splash.html';

Template.regionSplash.onRendered(function regionSplashOnRendered() {
	this.$('.js-region-splash').modal('show');
});

Template.regionSplash.events({
	'hidden.bs.modal .js-region-splash'() {
		const regionId = Session.get('region') || 'all';
		try {
			localStorage.setItem('region', regionId); // to survive page reload
		} catch (e) {
			Alert.error(e);
		}

		Session.set('showRegionSplash', false);
	},

	'click .js-region-link'(event, instance) {
		instance.$('.js-region-splash').modal('hide');
	},

	'click .js-region-search'(event, instance) {
		instance.$(event.currentTarget).select();
	},

	'click .js-confirm-region'(event, instance) {
		instance.$('.js-region-splash').modal('hide');
	},

	'click .js-login-for-region'(event, instance) {
		$('.js-account-tasks').modal('show');
		instance.$('.js-region-splash').modal('hide');
	},
});
