import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import '/imports/ui/components/regions/selection/region-selection.js';

import './region-splash.html';

Template.regionsSplash.onRendered(function regionsSplashOnRendered() {
	this.$('#regionsSplash').modal('show');
});

Template.regionsSplash.events({
	'hidden.bs.modal #regionsSplash'() {
		Session.set('showRegionSplash', false);
	},

	'click .js-region-search'(event, instance) {
		instance.$(event.currentTarget).select();
	},

	'click #confirmRegion'(event, instance) {
		instance.$('#regionsSplash').modal('hide');
	},

	'click #loginForRegion'(event, instance) {
		$('#accountTasks').modal('show');
		instance.$('#regionsSplash').modal('hide');
	}
});
