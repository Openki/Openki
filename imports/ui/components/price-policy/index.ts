import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import * as usersMethods from '/imports/api/users/methods';

import { Analytics } from '/imports/ui/lib/analytics';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<'pricePolicy'>;

	const template = Template.pricePolicy;

	template.helpers({
		hidePricePolicy() {
			if (Session.equals('hidePricePolicy', true)) {
				return true;
			}

			if (localStorage?.getItem('hidePricePolicy') === 'true') {
				return true;
			}

			if (Meteor.user()?.hidePricePolicy) {
				return true;
			}

			return false;
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<'pricePolicyContent'>;

	const template = Template.pricePolicyContent;

	template.helpers({
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
	});

	template.events({
		'click .js-hide-price-policy'() {
			Session.set('hidePricePolicy', true);
			try {
				localStorage.setItem('hidePricePolicy', 'true'); // Note: At July 2021, only string values were allowed.
			} catch {
				// ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
			}

			// if logged in, hide the policy permanently for this user
			if (Meteor.userId()) {
				usersMethods.hidePricePolicy();
			}

			Analytics.trackEvent('price', 'hide policy');
		},
	});
}
