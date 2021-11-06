import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import $ from 'jquery';

import '/imports/ui/components/regions/selection';

import './template.html';
import './styles.scss';

Template.regionSplash.onRendered(function () {
	this.$('.js-region-splash').modal('show');
});

Template.regionSplash.events({
	'hidden.bs.modal .js-region-splash'() {
		Session.set('showRegionSplash', false);
	},

	'click .js-region-link'(event, instance) {
		instance.$('.js-region-splash').modal('hide');
	},

	'click .js-region-search'(event, instance) {
		instance.$(event.currentTarget).trigger('select');
	},

	'click .js-confirm-region'(event, instance) {
		instance.$('.js-region-splash').modal('hide');
	},

	'click .js-login-for-region'(event, instance) {
		$('.js-account-tasks').modal('show');
		instance.$('.js-region-splash').modal('hide');
	},
});
