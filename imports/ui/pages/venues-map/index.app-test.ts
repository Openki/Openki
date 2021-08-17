import { assert } from 'chai';
import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';
import { MeteorAsync } from '/imports/utils/promisify';

if (Meteor.isClient) {
	describe('Venues map', function () {
		this.timeout(30000);
		before(async function () {
			this.timeout(8000);

			await MeteorAsync.loginWithPassword('greg', 'greg');
			Session.set('locale', 'en');
			Session.set('region', 'all');
		});

		it('should be navigable', async () => {
			const haveTitle = () => {
				assert($('h1').text().includes('Venues'), 'Title is present');
			};

			Router.go('venuesMap');
			await waitForSubscriptions();
			await waitFor(haveTitle);
		});
	});
}
