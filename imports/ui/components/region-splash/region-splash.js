import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import '../region-selection/region-selection.js';

import './region-splash.html';

Template.regionsSplash.onRendered(function () {
	this.$('#regionsSplash').modal('show');
});

Template.regionsSplash.events({
	'click .js-region-search': function(e, instance) {
		$(e.currentTarget).select();
	},

	'click .js-region-link, submit .js-region-search-form': function(e, instance) {
		var regionsSplash = instance.$('#regionsSplash');

		regionsSplash.modal('hide');
		regionsSplash.on('hidden.bs.modal', function() {
			Session.set('showRegionSplash', false);
		});
	},

	'click #loginForRegion': function(e, instance) {
		$('#accountTasks').modal('show');
		instance.$('#regionsSplash').modal('hide');
	}
});
