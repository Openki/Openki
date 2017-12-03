import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import './price-policy.html';

Template.pricePolicy.helpers({
	hidePricePolicy() {
		const hideFlags = [
			Session.get('hidePricePolicy'),
			localStorage.getItem('hidePricePolicy')
		];

		const user = Meteor.user();
		if (user) hideFlags.push(user.hidePricePolicy);

		return hideFlags.filter(Boolean).length > 0;
	}
});

Template.pricePolicyContent.helpers({
	cssClasses() {
		const classes = [];
		if (this.dismissable) classes.push('is-dismissable');
		if (this.wrap) classes.push(this.wrap);
		return classes.join(' ');
	},

	pricePolicyLink() {
		let link = '/FAQ';
		let locale = Session.get('locale');
		const localizedTitles =
			new Map()
			.set('de', 'dürfen-kurse-etwas-kosten')
			.set('en', 'why-can-not-i-ask-for-a-fixed-price-as-a-mentor');

		if (!localizedTitles.has(locale)) locale = locale.slice(0, 2);

		if (localizedTitles.has(locale)) link += '#' + localizedTitles.get(locale);
		return link;
	}
});

Template.pricePolicyContent.events({
	'click #hidePricePolicy'() {
		Session.set('hidePricePolicy', true);
		localStorage.setItem('hidePricePolicy', true);

		// if logged in, hide the policy always for this user
		const user = Meteor.user();
		if (user) Meteor.call('user.hidePricePolicy', user);
	}
});
