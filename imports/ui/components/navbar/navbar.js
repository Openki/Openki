import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import $ from 'jquery';

import { Regions } from '/imports/api/regions/regions';

import { ScssVars } from '/imports/ui/lib/scss-vars';
import * as Viewport from '/imports/ui/lib/viewport';
import { PublicSettings } from '/imports/utils/PublicSettings';

import '/imports/ui/components/regions/selection';
import '/imports/ui/components/language-selection';

import './navbar.html';

Template.navbar.onRendered(function () {
	const instance = this;
	const { gridFloatBreakpoint } = ScssVars;

	// if not collapsed give the navbar and active menu item a
	// class for when not at top
	if (Viewport.get().width > gridFloatBreakpoint) {
		$(window).on('scroll', () => {
			const navbar = instance.$('.navbar');
			const activeNavLink = instance.$('.navbar-link-active');
			const notAtTop = $(window).scrollTop() > 5;

			navbar.toggleClass('navbar-covering', notAtTop);
			activeNavLink.toggleClass('navbar-link-covering', notAtTop);
		});
	} else {
		$(document).on('click', (event) => {
			if (this.$(event.target).parents('.navbar-collapse').length === 0) {
				this.$('.navbar-collapse').collapse('hide');
			}
		});
	}
});

Template.navbar.helpers({
	connected() {
		return Meteor.status().status === 'connected';
	},

	connecting() {
		return Meteor.status().status === 'connecting';
	},

	headerLogo() {
		let headerLogo;

		const currentRegion = Regions.currentRegion();
		if (currentRegion?.custom?.headerLogo?.src) {
			// the region has a custom logo
			headerLogo = currentRegion.custom.headerLogo.src;
		} else {
			// general logo
			headerLogo = PublicSettings.headerLogo.src;
		}

		if (headerLogo.startsWith('data:image/')) {
			// base64 image
			return headerLogo;
		}

		if (headerLogo.startsWith(PublicSettings.s3.publicUrlBase)) {
			// in our s3 file storage
			return headerLogo;
		}

		// in the openki repository folder "public/logo/"
		return `/logo/${headerLogo}`;
	},

	headerAlt() {
		const currentRegion = Regions.currentRegion();
		if (currentRegion?.custom?.headerLogo?.alt) {
			return currentRegion.custom.headerLogo.alt;
		}

		return PublicSettings.headerLogo.alt;
	},

	notConnected() {
		return Meteor.status().status !== 'connecting' && Meteor.status().status !== 'connected';
	},

	siteStage() {
		const currentRegion = Regions.currentRegion();
		if (currentRegion?.custom?.siteStage) {
			return currentRegion.custom.siteStage;
		}

		return PublicSettings.siteStage;
	},

	activeClass(linkRoute, id) {
		const router = Router.current();
		if (router.route?.getName() === linkRoute) {
			if (typeof id === 'string' && router.params._id !== id) {
				return '';
			}
			return 'navbar-link-active';
		}
		return '';
	},

	toggleNavbarRight(LTRPos) {
		const isRTL = Session.equals('textDirectionality', 'rtl');

		if (LTRPos === 'left') {
			return isRTL ? 'navbar-right' : '';
		}
		return isRTL ? '' : 'navbar-right';
	},
});

Template.navbar.events({
	'click .js-nav-dropdown-close'(event, instance) {
		instance.$('.navbar-collapse').collapse('hide');
	},

	'show.bs.dropdown, hide.bs.dropdown .dropdown'(event, instance) {
		const { gridFloatBreakpoint } = ScssVars;

		if (Viewport.get().width <= gridFloatBreakpoint) {
			const container = instance.$('#bs-navbar-collapse-1');

			// make menu item scroll up when opening the dropdown menu
			if (event.type === 'show') {
				const scrollTo = $(event.currentTarget);

				container.animate({
					scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop(),
				});
			} else {
				container.scrollTop(0);
			}
		}
	},

	'show.bs.collapse .navbar-collapse'(event, instance){
		console.log("collapse content show event fired");
	},

	'hide.bs.collapse .navbar-collapse'(event, instance){
		console.log("collapse content hide event fired");
	},
});

Template.loginButton.helpers({
	loginServicesConfigured() {
		return Accounts.loginServicesConfigured();
	},
});

Template.loginButton.events({
	'click .js-open-login'() {
		$('.js-account-tasks').modal('show');
	},
});

Template.ownUserFrame.events({
	'click .js-logout'(event) {
		event.preventDefault();
		Meteor.logout();

		const routeName = Router.current().route?.getName();
		if (routeName === 'profile') {
			Router.go('userprofile', Meteor.user());
		}
	},

	'click .btn'() {
		$('.collapse').collapse('hide');
	},
});
