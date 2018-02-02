import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import RegionSelection from '/imports/utils/region-selection.js';
import UpdateViewport from '/imports/ui/lib/update-viewport.js';
import ScssVars from '/imports/ui/lib/scss-vars.js';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils.js';

import '/imports/ui/components/account-tasks/account-tasks.js';
import '/imports/ui/components/featured-group/featured-group.js';
import '/imports/ui/components/footer/footer.js';
import '/imports/ui/components/introduction/introduction.js';
import '/imports/ui/components/kiosk-link/kiosk-link.js';
import '/imports/ui/components/messages/messages.js';
import '/imports/ui/components/navbar/navbar.js';
import '/imports/ui/components/regions/splash/region-splash.js';
import '/imports/ui/components/translate-info/translate-info.js';

import './app-body.html';

Template.layout.helpers({
	testWarning: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning;
	},

	translate: function() {
		var route = Router.current().route;
		return route && route.getName() === "mfTrans";
	},

	mayTranslate: function() {
		return !!Meteor.user();
	},

	showRegionSplash: function() {
		var route = Router.current().route;
		if (!route) return false;

		return (
			RegionSelection.regionDependentRoutes.indexOf(route.getName()) >= 0
			&& Session.get('showRegionSplash')
		);
	},

	shownIntro: function() {
		return Introduction.shownIntro();
	},

	isAdminPage: () => Router.current().url.indexOf('admin') >= 0,

	isAdmin: () => UserPrivilegeUtils.privilegedTo('admin'),

	isNotAdminPanel() {
		const route = Router.current().route;
		return route && route.getName() !== 'adminPanel';
	}
});

Template.layout.events({
	// Clicks on the logo toggle the intro blurb, but only when already on home
	'click .js-toggle-introduction': function() {
		var route = Router.current().route;
		if (route && route.options.template === "findWrap") {
			Introduction.showIntro();
		}
	},

	"click .js-introduction-close-btn": function(event, instance) {
		Introduction.doneIntro();
	},

	"click .js-introduction-toggle-btn": function(event, instance) {
		if (Introduction.openedIntro()) {
			Introduction.closeIntro();
		} else {
			Introduction.openIntro();
		}
	}
});

Template.layout.rendered = function() {
	$(window).resize(function(){ UpdateViewport(); });
	Session.set('isRetina', (window.devicePixelRatio == 2));
};

/* Workaround to prevent iron-router from messing with server-side downloads
 *
 * Class 'js-download' must be added to those links.
 */
Template.layout.events({
	'click .js-download'(event) {
		event.stopPropagation();
	}
});

RouterAutoscroll.marginTop = ScssVars.navbarHeight;
