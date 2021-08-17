import { assert } from 'chai';
import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';
import { MeteorAsync } from '/imports/utils/promisify';

import { Users } from '/imports/api/users/users';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';

if (Meteor.isClient) {
	describe('userprofile page', function () {
		this.timeout(30000);
		before(async function () {
			this.timeout(8000);
			Session.set('locale', 'en');
			Session.set('region', 'all');
		});

		it('should be navigable', async () => {
			const haveTitle = () => {
				assert($('h1').text().includes('s Profile'), 'Title is present');
			};

			(await MeteorAsync.subscribe('userSearch', 'Sandro')).stop(); // load user from server
			const userId = Users.findOne({ username: 'Sandro' })?._id;
			Router.go('userprofile', { _id: userId, username: 'Sandro' });

			await waitForSubscriptions();
			await waitFor(haveTitle);
		});

		it('should allow admins to set "User has contributed"', async () => {
			const buttonIsNotPresent = () => {
				assert($('.js-has-contributed').length === 0, 'Button is not present');
			};
			const buttonIsPresent = () => {
				assert($('.js-has-contributed').length > 0, 'Button is present');
			};
			const contributionIconIsPresent = () => {
				assert(
					$(
						'a[data-tooltip="Sandro supported Hmmm with a donation. Click on the icon if you want to become a contributer as well."] i.fa.fa-heart',
					).length > 0,
					'Icon is present',
				);
			};

			// A previous test might have logged us in.
			if (Meteor.userId()) {
				await MeteorAsync.logout();
			}

			(await MeteorAsync.subscribe('userSearch', 'Sandro')).stop(); // load user from server
			const userId = Users.findOne({ username: 'Sandro' })?._id;
			Router.go('userprofile', { _id: userId, username: 'Sandro' });

			await waitForSubscriptions();

			await waitFor(buttonIsNotPresent);

			await MeteorAsync.loginWithPassword('greg', 'greg');

			await waitFor(buttonIsPresent);

			$('.js-has-contributed').trigger('click');

			await waitFor(contributionIconIsPresent);
		});

		it('should allow admins to unset "User has contributed"', async () => {
			const buttonIsNotPresent = () => {
				assert($('.js-unset-has-contributed').length === 0, 'Button is not present');
			};
			const buttonIsPresent = () => {
				assert($('.js-unset-has-contributed').length > 0, 'Button is present');
			};
			const contributionIconIsNotPresent = () => {
				assert(
					$(
						'a[data-tooltip="Sandro supported Hmmm with a donation. Click on the icon if you want to become a contributer as well."] i.fa.fa-heart',
					).length === 0,
					'Icon is not present',
				);
			};

			// A previous test might have logged us in.
			if (Meteor.userId()) {
				await MeteorAsync.logout();
			}

			(await MeteorAsync.subscribe('userSearch', 'Sandro')).stop(); // load user from server
			const userId = Users.findOne({ username: 'Sandro' })?._id;
			Router.go('userprofile', { _id: userId, username: 'Sandro' });

			await waitForSubscriptions();

			await waitFor(buttonIsNotPresent);

			await MeteorAsync.loginWithPassword('greg', 'greg');

			await waitFor(buttonIsPresent);

			$('.js-unset-has-contributed').trigger('click');

			await waitFor(contributionIconIsNotPresent);
		});
	});
}
