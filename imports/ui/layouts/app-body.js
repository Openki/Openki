import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import RegionSelection from '/imports/utils/region-selection';
import Introduction from '/imports/ui/lib/introduction';
import ScssVars from '/imports/ui/lib/scss-vars';
import UpdateViewport from '/imports/ui/lib/update-viewport';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

import '/imports/ui/components/account-tasks/account-tasks';
import '/imports/ui/components/alerts/alerts';
import '/imports/ui/components/email-request/email-request';
import '/imports/ui/components/featured-group/featured-group';
import '/imports/ui/components/footer/footer';
import '/imports/ui/components/introduction/introduction';
import '/imports/ui/components/kiosk-link/kiosk-link';
import '/imports/ui/components/navbar/navbar';
import '/imports/ui/components/regions/splash/region-splash';
import '/imports/ui/components/translate-info/translate-info';

import './app-body.html';

Template.layout.helpers({
	testWarning() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning;
	},

	translate() {
		const { route } = Router.current();
		return route && route.getName() === 'mfTrans';
	},

	mayTranslate() {
		return Boolean(Meteor.user());
	},

	showRegionSplash() {
		const { route } = Router.current();
		if (!route) {
			return false;
		}

		return (
			RegionSelection.regionDependentRoutes.indexOf(route.getName()) >= 0
			&& Session.get('showRegionSplash')
		);
	},

	isAdminPage: () => Router.current().url.indexOf('admin') >= 0,

	isAdmin: () => UserPrivilegeUtils.privilegedTo('admin'),

	isNotAdminPanel() {
		const { route } = Router.current();
		return route && route.getName() !== 'adminPanel';
	},
});

Template.layout.events({
	// Clicks on the logo toggle the intro blurb, but only when already on home
	'click .js-toggle-introduction'() {
		const { route } = Router.current();
		if (route && route.options.template === 'findWrap') {
			Introduction.showIntro();
		}
	},
});

Template.layout.rendered = function () {
	$(window).resize(() => { UpdateViewport(); });
	Session.set('isRetina', (window.devicePixelRatio === 2));
};

/* Workaround to prevent iron-router from messing with server-side downloads
 *
 * Class 'js-download' must be added to those links.
 */
Template.layout.events({
	'click .js-download'(event) {
		event.stopPropagation();
	},
});

RouterAutoscroll.marginTop = ScssVars.navbarHeight;
