import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import Analytics from '/imports/ui/lib/analytics';

import './price-policy.html';

Template.pricePolicy.helpers({
	hidePricePolicy() {
		const hideFlags = [
			Session.get('hidePricePolicy'),
			localStorage.getItem('hidePricePolicy'),
		];

		const user = Meteor.user();
		if (user) {
			hideFlags.push(user.hidePricePolicy);
		}

		return hideFlags.filter(Boolean).length > 0;
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

	/**
	 * Checks if price-policy is enabled for this instance.
	 * Its only disabled if you set the pricePolicyEnabled-var
	 * explicitly to false.
	 */
	pricePolicyEnabled() {
		const pricePolicyEnabled = Meteor.settings.public.pricePolicyEnabled;
		if (pricePolicyEnabled === false) {
			return false;
		}
		// price policy setting is not set, is ambiguos, or is set explicitly to true.
		return true;
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
		const user = Meteor.user();
		if (user) {
			Meteor.call('user.hidePricePolicy', user);
		}

		Analytics.trytrack((tracker) => {
			tracker.trackEvent('price', 'hide policy');
		});
	},
});
