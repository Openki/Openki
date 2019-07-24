import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import ScssVars from '/imports/ui/lib/scss-vars';

import '/imports/ui/components/regions/selection/region-selection';
import '/imports/ui/components/language-selection/language-selection';

import './navbar.html';

Template.navbar.onRendered(function () {
	const instance = this;
	const viewportWidth = Session.get('viewportWidth');
	const { gridFloatBreakpoint } = ScssVars;

	// if not collapsed give the navbar and active menu item a
	// class for when not at top
	if (viewportWidth > gridFloatBreakpoint) {
		$(window).scroll(() => {
			const navbar = instance.$('.navbar');
			const activeNavLink = instance.$('.navbar-link-active');
			const notAtTop = $(window).scrollTop() > 5;

			navbar.toggleClass('navbar-covering', notAtTop);
			activeNavLink.toggleClass('navbar-link-covering', notAtTop);
		});
	} else {
		$(document).click((event) => {
			if (this.$(event.target).parents('.navbar-collapse').length === 0) {
				this.$('.navbar-collapse').collapse('hide');
			}
		});
	}
});

Template.navbar.helpers({
	showTestWarning() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning;
	},

	connected() {
		return Meteor.status().status === 'connected';
	},

	connecting() {
		return Meteor.status().status === 'connecting';
	},

	notConnected() {
		return Meteor.status().status !== 'connecting' && Meteor.status().status !== 'connected';
	},

	siteStage() {
		if (Meteor.settings.public && Meteor.settings.public.siteStage) {
			return Meteor.settings.public.siteStage;
		}
		return '';
	},

	activeClass(linkRoute, id) {
		const router = Router.current();
		if (router.route && router.route.getName() === linkRoute) {
			if (typeof id === 'string' && router.params._id !== id) return '';
			return 'navbar-link-active';
		}
		return '';
	},

	toggleNavbarRight(LTRPos) {
		const isRTL = Session.get('textDirectionality') === 'rtl';

		if (LTRPos === 'left') {
			return isRTL ? 'navbar-right' : '';
		}
		return isRTL ? '' : 'navbar-right';
	},
});

Template.navbar.events({
	'click .js-nav-dropdown-close': function (event, instance) {
		instance.$('.navbar-collapse').collapse('hide');
	},

	'show.bs.dropdown, hide.bs.dropdown .dropdown': function (event, instance) {
		const viewportWidth = Session.get('viewportWidth');
		const { gridFloatBreakpoint } = ScssVars;

		if (viewportWidth <= gridFloatBreakpoint) {
			const container = instance.$('#bs-navbar-collapse-1');

			// make menu item scroll up when opening the dropdown menu
			if (event.type === 'show') {
				const scrollTo = $(event.currentTarget);

				container.animate({
					scrollTop: scrollTo.offset().top
						- container.offset().top
						+ container.scrollTop(),
				});
			} else {
				container.scrollTop(0);
			}
		}
	},
});

Template.loginButton.helpers({
	loginServicesConfigured() {
		return Accounts.loginServicesConfigured();
	},
});

Template.loginButton.events({
	'click #openLogin': function () {
		$('#accountTasks').modal('show');
	},
});

Template.ownUserFrame.events({
	'click .js-logout': function (event) {
		event.preventDefault();
		Meteor.logout();

		const routeName = Router.current().route.getName();
		if (routeName === 'profile') Router.go('userprofile', Meteor.user());
	},

	'click .btn': function () { $('.collapse').collapse('hide'); },
});
