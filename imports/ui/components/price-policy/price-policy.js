import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import * as usersMethods from '/imports/api/users/methods';
import { pricePolicyEnabled } from '/imports/utils/pricePolicyEnabled';

import { Analytics } from '/imports/ui/lib/analytics';

import './price-policy.html';

Template.pricePolicy.helpers({
	hidePricePolicy() {
		if (Session.equals('hidePricePolicy', true)) {
			return true;
		}

		if (localStorage?.getItem('hidePricePolicy')) {
			return true;
		}

		if (Meteor.user()?.hidePricePolicy) {
			return true;
		}

		return false;
	},
});

Template.pricePolicyContent.helpers({
	cssClasses() {
		const classes = [];
		if (this.dismissable) {
			classes.push('is-dismissable');
		}
		if (this.wrap) {
			classes.push(this.wrap);
		}
		return classes.join(' ');
	},

	pricePolicyEnabled() {
		return pricePolicyEnabled();
	},

	pricePolicyLink() {
		const link = '/FAQ';
		let locale = Session.get('locale');
		const localizedTitles = new Map()
			.set('de', 'dürfen-kurse-etwas-kosten')
			.set('en', 'why-can-not-i-ask-for-a-fixed-price-as-a-mentor');

		if (!localizedTitles.has(locale)) {
			locale = locale.slice(0, 2);
		}

		if (localizedTitles.has(locale)) {
			return `${link}#${localizedTitles.get(locale)}`;
		}
		return link;
	},
});

Template.pricePolicyContent.events({
	'click .js-hide-price-policy'() {
		Session.set('hidePricePolicy', true);
		localStorage.setItem('hidePricePolicy', true);

		// if logged in, hide the policy permanently for this user
		if (Meteor.userId()) {
			usersMethods.hidePricePolicy();
		}

		Analytics.trackEvent('price', 'hide policy');
	},
});
