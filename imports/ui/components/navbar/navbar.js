import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import ScssVars from '/imports/ui/lib/scss-vars.js';

import '/imports/ui/components/regions/selection/region-selection.js';
import '/imports/ui/components/language-selection/language-selection.js';

import './navbar.html';

Template.navbar.onRendered(function() {
	var instance = this;
	var viewportWidth = Session.get('viewportWidth');
	var gridFloatBreakpoint = ScssVars.gridFloatBreakpoint;

	// if not collapsed give the navbar and active menu item a
	// class for when not at top
	if (viewportWidth > gridFloatBreakpoint) {
		$(window).scroll(function () {
			var navbar = instance.$('.navbar');
			var activeNavLink = instance.$('.navbar-link-active');
			var notAtTop = $(window).scrollTop() > 5;

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
	showTestWarning: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.testWarning;
	},

	connected: function() {
		return Meteor.status().status === 'connected';
	},

	connecting: function() {
		return Meteor.status().status === 'connecting';
	},

	notConnected: function() {
		return Meteor.status().status !== 'connecting' && Meteor.status().status !== 'connected';
	},

	siteStage() {
		if (Meteor.settings.public && Meteor.settings.public.siteStage) {
			return Meteor.settings.public.siteStage;
		}
		return "";
	},

	activeClass: function(linkRoute, id) {
		var router = Router.current();
		if (router.route && router.route.getName() === linkRoute) {
			if (typeof id == 'string' && router.params._id !== id) return '';
			return 'navbar-link-active';
		} else {
			return '';
		}
	},

	toggleNavbarRight: function(LTRPos) {
		var isRTL = Session.get('textDirectionality') == 'rtl';

		if (LTRPos === 'left') {
			return isRTL ? 'navbar-right' : '';
		} else {
			return isRTL ? '' : 'navbar-right';
		}
	}
});

Template.navbar.events({
	'click .js-nav-dropdown-close': function(event, instance) {
		instance.$('.navbar-collapse').collapse('hide');
	},

	'show.bs.dropdown, hide.bs.dropdown .dropdown': function(e, instance) {
		var viewportWidth = Session.get('viewportWidth');
		var gridFloatBreakpoint = ScssVars.gridFloatBreakpoint;

		if (viewportWidth <= gridFloatBreakpoint) {
			var container = instance.$('#bs-navbar-collapse-1');

			// make menu item scroll up when opening the dropdown menu
			if (e.type == 'show') {
				var scrollTo = $(e.currentTarget);

				container.animate({
					scrollTop: scrollTo.offset().top
						- container.offset().top
						+ container.scrollTop()
				});
			} else {
				container.scrollTop(0);
			}
		}
	},
});

Template.loginButton.helpers({
	'loginServicesConfigured': function() {
		return Accounts.loginServicesConfigured();
	}
});

Template.loginButton.events({
	'click #openLogin'() {
		$('#accountTasks').modal('show');
	}
});

Template.ownUserFrame.events({
	'click .js-logout'(event){
		event.preventDefault();
		Meteor.logout();

		const routeName = Router.current().route.getName();
		if (routeName === 'profile') Router.go('userprofile', Meteor.user());
	},

	'click .btn'() { $('.collapse').collapse('hide'); }
});
