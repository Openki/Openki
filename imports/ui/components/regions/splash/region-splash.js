import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import '/imports/ui/components/regions/selection/region-selection.js';

import './region-splash.html';

Template.regionSplash.onRendered(function regionSplashOnRendered() {
	this.$('#regionSplash').modal('show');
});

Template.regionSplash.events({
	'hidden.bs.modal #regionSplash'() {
		const regionId = Session.get('region') || 'all';
		try {
			localStorage.setItem("region", regionId); // to survive page reload
		} catch (e) {
			console.error(e);
		}

		Session.set('showRegionSplash', false);
	},

	'click .js-region-link'(event, instance) {
		instance.$('#regionSplash').modal('hide');
	},

	'click .js-region-search'(event, instance) {
		instance.$(event.currentTarget).select();
	},

	'click #confirmRegion'(event, instance) {
		instance.$('#regionSplash').modal('hide');
	},

	'click #loginForRegion'(event, instance) {
		$('#accountTasks').modal('show');
		instance.$('#regionSplash').modal('hide');
	}
});
